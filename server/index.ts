import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client';
import path from 'path'

// const history = require('connect-history-api-fallback');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
const app = express()

// Enable CORS for requests from localhost:3000 (or any origin you'd like)
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from localhost:3000
  }));

app.use(express.json())
// app.use(history());

// get all users in db
app.get('/api/users', async (req, res) => {
    const test = req.body
    console.log(test)
    try {
        // Fetch all users from the database using Prisma
        const users = await prisma.user.findMany();

        if (users.length > 0) {
            res.status(200).json(users);
        } else {
            res.status(204).json({ error: 'No users found' });
        }
    } catch (error) {
        // Handle errors (e.g., if the query fails)
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// get user by id
app.get('/api/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Fetch a specific user by id
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
        });

        if (user) {
            res.status(200).json(user);
        } else {
            res.status(204).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// gets all users within organization with a specified position
app.get('/api/org-users', async (req, res) => {
    // Ensure position and organization are strings
    const position = typeof req.query.position === 'string' ? req.query.position : undefined;
    const organization = typeof req.query.organization === 'string' ? req.query.organization : undefined;

    try {
        // Fetch all users with the specific position and organization
        const users = await prisma.user.findMany({
            where: {
                ...(organization ? { organization: { equals: organization } } : {}),
                ...(position && position !== 'All' ? { position: { equals: position } } : {}),
            },
        });

        if (users.length > 0) {
            res.status(200).json(users);
        } else {
            res.status(204).json({ data: 'No users found for the given position and organization' });
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// gets all users with specific country
app.get('/api/country', async (req, res) => {
    // Ensure country is string
    const country = typeof req.query.country === 'string' ? req.query.country : undefined;

    try {
        // Fetch all users with the specific position, organization, and country
        const users = await prisma.user.findMany({
            where: { country: { equals: country } },
        });

        if (users.length > 0) {
            res.status(200).json(users);
        } else {
            res.status(204).json();
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get all duplicate first/last name combinations
app.get('/api/duplicates', async (req, res) => {

    const count = parseInt(req.query.count as string, 10);
    // Default to 1 if count is missing or invalid
    const minCount = isNaN(count) ? 1 : count;
    console.log(minCount)

    try {
        // Group by firstName and lastName and count the number of occurrences
        const duplicates = await prisma.user.groupBy({
            by: ['first_name', 'last_name'],  // Group by first and last name
            _count: {
                id: true  // Count how many users have the same first/last name combination
            },
            having: {
                first_name: {
                    _count: {
                        gt: 1
                    }
                }
            }
        });

        // Filter out entries with _count.id <= minCount
        const filtered = duplicates.filter(user => user._count.id > minCount);

        if (filtered.length > 0) {
            res.status(200).json(filtered);
        } else {
            res.status(204).json();
        }
    } catch (error) {
        // Handle errors (e.g., if the query fails)
        console.error('Error fetching duplicates:', error);
        res.status(500).json({ error: 'Failed to fetch duplicate names' });
    }
});


// login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Fetch the user by username
        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            res.status(404).json({ error: 'Username does not exist.' });
        } else {
            // Compare the plain password with the hashed password stored in the database
            const passwordMatch = await bcrypt.compare(password, user.password);
    
            if (passwordMatch) {
                // Passwords match, return user information (excluding the password)
                const { password, ...userWithoutPassword } = user;
                res.status(200).json(userWithoutPassword);
            } else {
                // Password doesn't match
                res.status(401).json({ error: 'Incorrect password' });
            }
        }

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Failed to authenticate user' });
    }
});


// put new user in db (sign up)
app.post('/api/users', async (req, res) => {
    const { first_name, last_name, position, organization, username, password, email, country, active } = req.body;

    try {
        // Generate a salt to use for hashing the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await prisma.user.create({
            data: {
                first_name,
                last_name,
                position,
                organization,
                username,
                password: hashedPassword,
                email,
                country,
                active,
            },
        });

        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user, username already exists.' });
    }
});

// update user in db
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, position, country, email, active } = req.body;

    try {
        // Find the user by id and update it
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                first_name,
                last_name,
                position,
                country,
                email,
                active,
            },
        });
        console.log(updatedUser)

        res.status(200).json({ message: 'User updated successfully.'});
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Failed to update user' });
    }
});

// delete user in db
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Delete the user from the database
        const deletedUser = await prisma.user.delete({
            where: { id: parseInt(id) },
        });

        res.status(200).json({ message: `User deleted successfully: ${deletedUser.first_name} ${deletedUser.last_name}.` });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Failed to delete user' });
    }
});

app.get('/api/health', (_, res, __) => {
    res.sendStatus(200);
})

// Serve static files from the dist folder
app.use(express.static(path.join(__dirname, '../dist')));

// For Single Page Application (SPA) routing
app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

const server = app.listen(3001)

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', {
        message: err.message,
        stack: err.stack,
    })
    server.close(() => {
        console.log('Server Closed')
        void prisma.$disconnect();
        process.exit(1) // Exit the process with a failure code
    })

    // If server.close() doesn't work for some reason, exit immediately
    setTimeout(() => {
        console.log('Forcing process exit');
        void prisma.$disconnect();
        process.exit(1);
    }, 5000); // Force exit after 5 seconds in case server doesn't close
})

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    server.close(() => {
        console.log('Server Closed')
        void prisma.$disconnect();
        process.exit(1) // Exit the process with a failure code
    })

    // If server.close() doesn't work for some reason, exit immediately
    setTimeout(() => {
        console.log('Forcing process exit');
        void prisma.$disconnect();
        process.exit(1);
    }, 5000); // Force exit after 5 seconds in case server doesn't close
})

process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Cleaning up...');
    server.close(() => {
        console.log('Server Closed')
        void prisma.$disconnect();
        process.exit(0);
    })
})

process.on('SIGINT', () => {
    console.log('Received SIGINT. Cleaning up...');
    server.close(() => {
        console.log('Server Closed')
        void prisma.$disconnect();
        process.exit(0);
    })
})
import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client';
import path from 'path'

const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
const app = express()

// Enable CORS for requests from localhost:3000 (or any origin you'd like)
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from localhost:3000
  }));

app.use(express.json())

// get all users in db
app.get('/api/users', async (req, res) => {
    const test = req.body
    console.log(test)
    try {
        // Fetch all users from the database using Prisma
        const users = await prisma.user.findMany();

        // Return the users as a JSON response
        res.status(200).json(users);
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
            res.status(404).json({ error: 'User not found' });
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
                position: position ? { equals: position } : undefined, // Filter by position if specified
                organization: organization ? { equals: organization } : undefined, // Filter by organization if specified
            },
        });

        if (users.length > 0) {
            res.status(200).json(users);
        } else {
            res.status(404).json({ error: 'No users found for the given position and organization' });
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Fetch the user by username
        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
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


// put new user in db
app.post('/api/users', async (req, res) => {
    const { first_name, last_name, position, organization, username, password, email, active } = req.body;

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
                active,
            },
        });

        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// update user in db
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { first_name, email, last_name, active } = req.body;

    try {
        // Find the user by id and update it
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                first_name,
                email,
                last_name,
                active,
            },
        });

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
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

        res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
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
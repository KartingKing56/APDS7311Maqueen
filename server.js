import express from 'express';
import db from '../db/conn.mjs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

const router = express.Router();

// Rate limiter configuration
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 5, // Limit each IP to 5 login attempts per windowMs
    message: "Too many login attempts, please try again after 15 minutes.",
});

// Signup route (server-side method)
router.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Please provide both name and password.' });
        }

        const salt = await genSalt(10);

        // Hash the password with bcrypt
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user document
        const newUser = { username, password: hashedPassword };

        // Insert the new user into the database
        const collection = await db.collection('users');
        const result = await collection.insertOne(newUser);

        res.status(201).json({ result, message: 'User created successfully' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Signup failed.' });
    }
});

// Login route (server-side method)
router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        // Retrieve the user from the database
        const collection = await db.collection('users');
        const user = await collection.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // Compare the entered password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // Authentication successful, create a JWT token
        const token = jwt.sign({ name: user.username }, 'this_secret_should_be_longer_than_it_is', { expiresIn: '1h' });

        res.status(200).json({
            message: 'Authentication successful',
            token,
            username: user.username,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed.' });
    }
});

app.use(cors());

export default router;

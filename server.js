import express from 'express';
import db from '../db/conn.mjs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { ObjectId } from "mongodb";

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
        // Extract the fields from the request body
        const { name, surname, idNumber, email, accountNumber, password } = req.body;

        // Validate that all fields are present
        if (!name || !surname || !idNumber || !email || !accountNumber || !password) {
            return res.status(400).json({ message: 'Please provide all required fields: name, surname, idNumber, email, accountNumber, and password.' });
        }

        // Generate salt for password hashing
        const salt = await bcrypt.genSalt(10);

        // Hash the password with bcrypt
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user document
        const newUser = {
            name,
            surname,
            idNumber,
            email,
            accountNumber,
            password: hashedPassword, // Store hashed password
        };

        // Insert the new user into the database
        const collection = await db.collection('users');
        const result = await collection.insertOne(newUser);

        // Respond with success
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

        // Retrieve the user from the database, checking if the username is an email or account number
        const collection = await db.collection('users');

        // Check if the username is either an email or account number
        const user = await collection.findOne({
            $or: [
                { email: username },  // If username matches email
                { accountNumber: username }  // Or if username matches account number
            ]
        });

        // If no user is found, return an error
        if (!user) {
            return res.status(401).json({ message: 'Invalid email/account number or password.' });
        }

        // Compare the entered password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email/account number or password.' });
        }

        // Authentication successful, create a JWT token
        const token = jwt.sign({ name: user.name, email: user.email }, 'this_secret_should_be_longer_than_it_is', { expiresIn: '1h' });

        res.status(200).json({
            message: 'Authentication successful',
            token,
            username: user.email || user.accountNumber,  // Return either email or account number
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed.' });
    }
});

app.use(cors());

export default router;

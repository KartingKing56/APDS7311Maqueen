import express from 'express';
import db from './db/conn.mjs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { ObjectId } from 'mongodb';
import session from 'express-session'; //Davin

const app = express(); // Create the Express app
const router = express.Router();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // To parse JSON request bodies

//-------------------------------Davin-Start----------------------------------------------//

// Session Timeout
app.use(session({ 
    secret: 'yourSecretKey', 
    resave: false, 
    saveUninitialized: true, 
    cookie: { 
        secure: true, 
        httpOnly: true, 
        sameSite: 'Strict', 
        maxAge: 30 * 60 * 1000 // 30 minutes
    } 
})); 

// Use Regenerate ID in (post.mjs)
app.use('/api', postRouter);

//-------------------------------Davin-End------------------------------------------------//

// Rate limiter configuration
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 5, // Limit each IP to 5 login attempts per windowMs
    message: 'Too many login attempts, please try again after 15 minutes.',
});

// Signup route (server-side method)
router.post('/signup', async (req, res) => {
    try {
        const { name, surname, idNumber, email, accountNumber, password } = req.body;

        if (!name || !surname || !idNumber || !email || !accountNumber || !password) {
            return res.status(400).json({ message: 'Please provide all required fields: name, surname, idNumber, email, accountNumber, and password.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            name,
            surname,
            idNumber,
            email,
            accountNumber,
            password: hashedPassword, // Store hashed password
        };

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
        console.log("Login attempt with:", req.body);
        
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required.' });
        }

        if (username.includes("emp")) {
            const collection = db.collection('employees');
            const user = await collection.findOne({ username });
            console.log("Employee found:", user);

            if (!user) {
                return res.status(401).json({ message: 'Invalid username or password.' });
            }

            const passwordMatch = user.password === password;

            if (!passwordMatch) {
                return res.status(401).json({ message: 'Invalid username or password.' });
            }

            const token = jwt.sign(
                { name: user.name, username: user.username, role: "employee" , userId: user._id},
                'this_secret_should_be_longer_than_it_is',
                { expiresIn: '1h' }
            );

            res.status(200).json({
                message: 'Authentication successful',
                token,
                username: user.username,
            });
        } else {
            const collection = db.collection('users');
            const user = await collection.findOne({
                $or: [
                    { email: username },
                    { accountNumber: username }
                ]
            });
            console.log("User found:", user);

            if (!user) {
                return res.status(401).json({ message: 'Invalid email/account number or password.' });
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ message: 'Invalid email/account number or password.' });
            }

            const token = jwt.sign(
                { name: user.name, email: user.email , role: "customer", userId: user._id},
                'this_secret_should_be_longer_than_it_is',
                { expiresIn: '1h' }
            );

            res.status(200).json({
                message: 'Authentication successful',
                token,
                username: user.email || user.accountNumber,
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed.' });
    }
});

router.get('/getPayments', async (req, res) => {
    try {
        const paymentsCollection = db.collection('payments');
        const paymentsCursor = await paymentsCollection.find({});
        const payments = await paymentsCursor.toArray();

        res.status(200).json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ message: 'Error retrieving payment data.' });
    }
});

router.get('/getPaymentsByUser', async (req, res) => {
    const { userId } = req.query; // Get userId from query parameters
    
    try {
        const paymentsCollection = db.collection('payments');
        const paymentsCursor = await paymentsCollection.find({ customerId: userId }); // Match on customerId
        const payments = await paymentsCursor
            .sort({ date: -1 }) 
            .limit(5)  
            .toArray();

        res.status(200).json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ message: 'Error retrieving payment data.' });
    }
});

router.post('/verifyToken', (req, res) => {
    const { token } = req.body;

    try {
        // Verify the token
        const decodedToken = jwt.verify(token, 'this_secret_should_be_longer_than_it_is');
        
        // Send back the decoded token information
        res.json({ success: true, data: decodedToken });
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
});

router.post('/addPayment', async (req, res) => {
    const { currency, provider, amount, recipientName, recipientBank, 
        recipientAccount, swiftCode, date, status, customerId } = req.body;

    try {
        const paymentsCollection = db.collection('payments');

        // Define the payment document
        const newPayment = {
            currency,
            provider,
            amount,
            recipientName,
            recipientBank,
            recipientAccount,
            swiftCode,
            formattedDate: new Date().toISOString().split('T')[0], 
            date: date, // Use current date if not provided
            status,
            customerId,
        };

        // Insert the payment document
        const result = await paymentsCollection.insertOne(newPayment);

        res.status(201).json({
            message: 'Payment added successfully',
            paymentId: result.insertedId,
        });
    } catch (error) {
        console.error('Error adding payment:', error);
        res.status(500).json({ error: 'An error occurred while adding the payment' });
    }
});

// Use the router
app.use('/api', router);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

import express from 'express';
import db from './db/conn.mjs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { ObjectId } from 'mongodb';

const app = express(); // Create the Express app
const router = express.Router();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // To parse JSON request bodies

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
                { name: user.name, surname: user.surname, username: user.username, role: "employee" , userId: user._id},
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
                { name: user.name, email: user.email , role: "customer", userId: user._id, accountNumber: user.accountNumber},
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

router.get('/getCustomerById', async (req, res) => {
    const { customerId } = req.query; // Get customerId from query parameters

    if (!ObjectId.isValid(customerId)) {
        return res.status(400).json({ message: 'Invalid customer ID' });
    }

    try {
        const customerObjectId = new ObjectId(customerId);
        const customersCollection = db.collection('users');
        const customer = await customersCollection.findOne({ _id: customerObjectId });

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Assuming firstName and lastName are the fields in your MongoDB document
        const { name, surname } = customer;
        res.status(200).json({ name: name, surname: surname });  // Send the response in the expected format
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({ message: 'Error retrieving customer data' });
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

router.put('/updatePaymentStatus', async (req, res) => {
    const { name, bank, accountNumber, amount, swift, newStatus } = req.body;

    // Log request body
    console.log('Request received with body:', req.body);

    try {
        const paymentsCollection = db.collection('payments');

        // Log document search criteria
        console.log('Finding document with criteria:', {
            recipientName: name,
            recipientBank: bank,
            recipientAccount: accountNumber,
            amount: amount,
            swiftCode: swift
        });

        const payment = await paymentsCollection.findOne({
            recipientName: name,
            recipientBank: bank,
            recipientAccount: accountNumber,
            amount: amount,
            swiftCode: swift
        });

        if (!payment) {
            console.log('No matching payment found');
            return res.status(404).json({ message: 'No matching payment found' });
        }

        console.log('Payment found:', payment);

        const result = await paymentsCollection.updateOne(
            { _id: payment._id },
            { $set: { status: newStatus } }
        );

        if (result.modifiedCount === 0) {
            console.log('Update operation failed');
            return res.status(500).json({ message: 'Failed to update payment status' });
        }

        res.status(200).json({ message: 'Payment status updated successfully' });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ message: 'Error updating payment status' });
    }
});

// Use the router
app.use('/api', router);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

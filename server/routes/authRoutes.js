const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   POST /api/auth/login
// @desc    Auth user & get token (simulated)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: 'fake-jwt-token-12345' // Simulated token for simplicity
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/auth/seed
// @desc    Seed database with dummy users (Admin, Driver, Customer, etc.)
router.post('/seed', async (req, res) => {
    try {
        await User.deleteMany(); // Clear existing users

        const seedUsers = [
            { name: 'Admin User', email: 'admin@impact.com', password: 'password123', role: 'admin' },
            { name: 'System Manager', email: 'manager@impact.com', password: 'password123', role: 'manager' },
            { name: 'Warehouse Lead', email: 'warehouse@impact.com', password: 'password123', role: 'warehouse' },
            { name: 'Driver John', email: 'driver@impact.com', password: 'password123', role: 'driver' },
            { name: 'Valued Customer', email: 'customer@impact.com', password: 'password123', role: 'customer' },
            { name: 'Parcel Receiver', email: 'receiver@impact.com', password: 'password123', role: 'parcel_receiver' },
        ];

        const createdUsers = await User.insertMany(seedUsers);
        res.status(201).json({ message: 'Database seeded successfully', createdUsers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { loginUser, registerUser, changePassword, deleteAccount } = require('../controllers/authController');
=======
const { loginUser, registerUser, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
>>>>>>> 325c4039c10287285b4dcd647c557890aca4518f

// @route   POST /api/auth/login
// @desc    Auth user & get token
router.post('/login', loginUser);

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', registerUser);

// @route   PUT /api/auth/profile
// @desc    Update user profile & location
router.put('/profile', protect, updateProfile);

// @route   POST /api/auth/seed
// @desc    Seed database with dummy users (Admin, Driver, Customer, etc.)
router.post('/seed', async (req, res) => {
    try {
        const User = require('../models/User'); // Import dynamically if needed, or at the top
        await User.deleteMany(); // Clear existing users

        const seedUsers = [
            { name: 'Admin User', email: 'admin@impact.com', password: 'password123', role: 'admin' },
            { name: 'System Manager', email: 'manager@impact.com', password: 'password123', role: 'manager' },
            { name: 'Warehouse Lead', email: 'warehouse@impact.com', password: 'password123', role: 'warehouse' },
            { name: 'Driver John', email: 'driver@impact.com', password: 'password123', role: 'driver' },
            { name: 'Valued Customer', email: 'customer@impact.com', password: 'password123', role: 'customer' },
            { name: 'Parcel Receiver', email: 'receiver@impact.com', password: 'password123', role: 'parcel_receiver' },
            { name: 'Retail Seller', email: 'seller@impact.com', password: 'password123', role: 'seller' }
        ];

        // Use create in a loop or await Promise.all so Mongoose pre('save') hooks run and hash passwords
        const createdUsers = [];
        for (const userData of seedUsers) {
            const user = await User.create(userData);
            createdUsers.push(user);
        }

        res.status(201).json({ message: 'Database seeded successfully, passwords hashed.', createdUsers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const { protect } = require('../middleware/authMiddleware');
const { updateProfile, updatePreferences, updatePlatforms, updateVisibility } = require('../controllers/userSettingsController');

router.post('/change-password', protect, changePassword);
router.put('/profile', protect, updateProfile);
router.put('/preferences', protect, updatePreferences);
router.put('/platforms', protect, updatePlatforms);
router.put('/visibility', protect, updateVisibility);
router.delete('/account', protect, deleteAccount);

module.exports = router;

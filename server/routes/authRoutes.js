const express = require('express');
const router = express.Router();
const { loginUser, registerUser } = require('../controllers/authController');

// @route   POST /api/auth/login
// @desc    Auth user & get token
router.post('/login', loginUser);

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', registerUser);

module.exports = router;

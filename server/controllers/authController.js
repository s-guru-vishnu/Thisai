const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                region: user.region,
                hub: user.hub,
                location: user.location,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'customer'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                location: user.location,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

<<<<<<< HEAD
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    try {
        const user = await User.findById(req.user._id);

        if (user && (await user.matchPassword(currentPassword))) {
            // Validate password complexity: min 8 chars, 1 uppercase, 1 number
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
            if (!passwordRegex.test(newPassword)) {
                return res.status(400).json({ message: 'Password must be at least 8 characters long, contain at least one uppercase letter and one number.' });
            }

            user.password = newPassword;
            await user.save();

            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(401).json({ message: 'Invalid current password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            await User.deleteOne({ _id: user._id });
            res.json({ message: 'User account deleted successfully' });
=======
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.location = req.body.location || user.location;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                region: updatedUser.region,
                hub: updatedUser.hub,
                location: updatedUser.location,
                token: generateToken(updatedUser._id)
            });
>>>>>>> 325c4039c10287285b4dcd647c557890aca4518f
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

<<<<<<< HEAD
module.exports = { loginUser, registerUser, changePassword, deleteAccount };
=======
module.exports = { loginUser, registerUser, updateProfile };
>>>>>>> 325c4039c10287285b4dcd647c557890aca4518f

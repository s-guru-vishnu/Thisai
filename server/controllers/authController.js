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
                userId: user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                location: user.location,
                preferences: user.preferences,
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
            role: role || 'customer',
            region: req.body.region,
            hub: req.body.hub,
            location: req.body.location
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                userId: user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                region: user.region,
                hub: user.hub,
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
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const findCustomerByEmail = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email, role: 'customer' }).select('name location email');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllUsers = async (req, res) => {
    console.log(`GET /api/auth/users called by ${req.user?.email} (${req.user?.role})`);
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        res.status(500).json({ message: error.message });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        
        // Block managers from assigning cargo_driver role
        if (role === 'cargo_driver' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Only admins can assign Cargo Driver roles.' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Role Enforcement Group
        const manageableRoles = req.user.role === 'admin' 
            ? ['customer', 'delivery_driver', 'cargo_driver', 'driver'] 
            : ['customer', 'delivery_driver', 'driver'];
            
        const targetableRoles = ['customer', 'delivery_driver'];

        // Restriction: Non-admins have limited target roles and manageable users
        if (req.user.role !== 'admin') {
            if (!targetableRoles.includes(role)) {
                return res.status(403).json({ message: `Access denied: Managers cannot assign the ${role} role.` });
            }
            if (!manageableRoles.includes(user.role)) {
                return res.status(403).json({ message: `Access denied: Managers cannot modify ${user.role.replace('_', ' ')} roles.` });
            }
        }

        user.role = role || user.role;
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get all warehouse users
// @route   GET /api/auth/warehouses
// @access  Public (or semi-public)
const getWarehouses = async (req, res) => {
    try {
        const warehouses = await User.find({ role: 'warehouse' }).select('name _id city region hub');
        res.json(warehouses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { loginUser, registerUser, changePassword, deleteAccount, findCustomerByEmail, getAllUsers, updateUserRole, getWarehouses };

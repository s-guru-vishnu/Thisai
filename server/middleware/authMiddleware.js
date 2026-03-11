const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
        }
        next();
    };
};

const checkLocation = (req, res, next) => {
    if (!req.user || !req.user.location || !req.user.location.addressLine1 || !req.user.location.city) {
        return res.status(403).json({ 
            message: 'Location Required: Please add your location in profile settings before performing this action.',
            code: 'LOCATION_REQUIRED'
        });
    }
    next();
};

module.exports = { protect, authorize, checkLocation };

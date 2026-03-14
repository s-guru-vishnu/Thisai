const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Address = require('../models/Address');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            req.user = await User.findById(decoded.id).select('-password');
            return next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            console.log(`Authorization failed: User ${req.user.email} has role ${req.user.role}, but roles ${roles} are required.`);
            return res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
        }
        next();
    };
};

const checkLocation = async (req, res, next) => {
    // 1. If profile location is COMPLETE, allow
    if (req.user && req.user.location && req.user.location.addressLine1 && req.user.location.city) {
        return next();
    }
    
    // 2. If Seller, allow (they have fallback logic in createParcel to find hubs by addresses)
    if (req.user && req.user.role === 'seller') {
        return next();
    }
    
    // 3. Check Address Book fallback
    try {
        const hasAddress = await Address.findOne({ userId: req.user?._id });
        if (hasAddress) {
            return next();
        }
    } catch (err) {
        console.error('Error in checkLocation middleware:', err);
    }

    // 4. Block if nothing found
    return res.status(403).json({ 
        message: 'Location Required: Please add your location in profile settings before performing this action.',
        code: 'LOCATION_REQUIRED'
    });
};

module.exports = { protect, authorize, checkLocation };

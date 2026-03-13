const User = require('../models/User');

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            const allowedFields = [
                'name', 'email', 'phone', 'timezone', 'avatar', 'country', 'city',
                
                // Admin
                'companyName', 'companyType', 'headOfficeAddress', 'totalWarehouses', 'totalDrivers', 'businessRegistrationNumber',
                
                // Manager
                'assignedWarehouse', 'teamSize', 'deliveryRegion', 'operatingShift', 'department',
                
                // Driver
                'driverLicenseNumber', 'vehicleType', 'vehicleNumber', 'yearsOfExperience', 'assignedHub', 'workingShift',
                
                // Customer
                'defaultDeliveryAddress', 'preferredDeliveryTime', 'contactPreference', 'orderNotifications',
                
                // Receiver
                'receiverAddress', 'alternateContactNumber', 'deliveryInstructions',
                
                // Seller
                'storeName', 'businessType', 'warehouseLocation', 'averageDailyOrders', 'returnAddress', 'gstNumber',
                
                // General / Legacy
                'taxId', 'region', 'hub', 'liveLocationSharing', 'nearestWarehouse'
            ];
            
            // Dynamically assign simple fields
            allowedFields.forEach(field => {
                if (req.body[field] !== undefined) {
                    user[field] = req.body[field];
                }
            });

            // Logistics Preferences
            if (req.body.logisticsPreferences) {
                user.logisticsPreferences = { ...user.logisticsPreferences, ...req.body.logisticsPreferences };
            }

            // Operational Details
            if (req.body.operationalDetails) {
                user.operationalDetails = { ...user.operationalDetails, ...req.body.operationalDetails };
            }

            // Structured Location Object
            if (req.body.location) {
                user.location = { ...user.location, ...req.body.location };
            }

            const updatedUser = await user.save();
            
            // Return safe user context object
            const userObj = updatedUser.toObject();
            delete userObj.password;
            
            res.json(userObj);
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update user appearance preferences
// @route   PUT /api/auth/preferences
// @access  Private
const updatePreferences = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            if (req.body.theme) user.preferences.theme = req.body.theme;
            if (req.body.accentColor) user.preferences.accentColor = req.body.accentColor;

            const updatedUser = await user.save();
            res.json(updatedUser.preferences);
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update user platforms and integrations
// @route   PUT /api/auth/platforms
// @access  Private
const updatePlatforms = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            if (req.body.ecommerce) user.platforms.ecommerce = req.body.ecommerce;
            if (req.body.logistics) user.platforms.logistics = req.body.logistics;

            const updatedUser = await user.save();
            res.json(updatedUser.platforms);
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// @desc    Update user visibility controls
// @route   PUT /api/auth/visibility
// @access  Private
const updateVisibility = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.visibility = { ...user.visibility, ...req.body };
            const updatedUser = await user.save();
            res.json(updatedUser.visibility);
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    updateProfile,
    updatePreferences,
    updatePlatforms,
    updateVisibility
};

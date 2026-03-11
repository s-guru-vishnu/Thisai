const User = require('../models/User');

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // Base User Params
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email; // Allow email change from Accounts Tab
            user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
            user.timezone = req.body.timezone || user.timezone;
            user.avatar = req.body.avatar || user.avatar;

            // Basic Info - Business
            if (req.body.companyName !== undefined) user.companyName = req.body.companyName;
            if (req.body.companyType !== undefined) user.companyType = req.body.companyType;
            if (req.body.businessAddress !== undefined) user.businessAddress = req.body.businessAddress;
            if (req.body.warehouseLocation !== undefined) user.warehouseLocation = req.body.warehouseLocation;
            if (req.body.country !== undefined) user.country = req.body.country;
            if (req.body.city !== undefined) user.city = req.body.city;
            if (req.body.taxId !== undefined) user.taxId = req.body.taxId;

            // Logistics Preferences
            if (req.body.logisticsPreferences) {
                user.logisticsPreferences = { ...user.logisticsPreferences, ...req.body.logisticsPreferences };
            }

            // Operational Details
            if (req.body.operationalDetails) {
                user.operationalDetails = { ...user.operationalDetails, ...req.body.operationalDetails };
            }

            const updatedUser = await user.save();

            // Return safe user context object
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                phone: updatedUser.phone,
                timezone: updatedUser.timezone,
                avatar: updatedUser.avatar,
                companyName: updatedUser.companyName,
                companyType: updatedUser.companyType,
                businessAddress: updatedUser.businessAddress,
                warehouseLocation: updatedUser.warehouseLocation,
                country: updatedUser.country,
                city: updatedUser.city,
                taxId: updatedUser.taxId,
                logisticsPreferences: updatedUser.logisticsPreferences,
                operationalDetails: updatedUser.operationalDetails,
                preferences: updatedUser.preferences,
                platforms: updatedUser.platforms,
                visibility: updatedUser.visibility
            });
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

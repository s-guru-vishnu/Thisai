const { getCargoPath } = require('../utils/logisticsRoutes');
const User = require('../models/User');

// @desc    Calculate path between two hubs
// @route   GET /api/logistics/path
// @access  Private
const getPath = async (req, res) => {
    try {
        const { startHub, endHub } = req.query;

        if (!startHub || !endHub) {
            return res.status(400).json({ message: 'Start and end hubs are required' });
        }

        const stops = getCargoPath(startHub, endHub);
        res.json({ stops });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPath };

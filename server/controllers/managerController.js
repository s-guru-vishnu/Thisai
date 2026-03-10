const Parcel = require('../models/Parcel');
const User = require('../models/User');
const Warehouse = require('../models/Warehouse');

// @desc    Assign driver to parcel
// @route   PUT /api/manager/parcels/:id/assign
// @access  Private/Manager
const assignDriver = async (req, res) => {
    try {
        const { driverId } = req.body;
        const parcel = await Parcel.findById(req.params.id);
        if (parcel) {
            parcel.assignedDriver = driverId;
            const updatedParcel = await parcel.save();
            res.json(updatedParcel);
        } else {
            res.status(404).json({ message: 'Parcel not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all drivers
// @route   GET /api/manager/drivers
// @access  Private/Manager
const getDrivers = async (req, res) => {
    try {
        const drivers = await User.find({ role: 'driver' });
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get warehouse parcels
// @route   GET /api/manager/warehouses/:id/parcels
// @access  Private/Manager
const getWarehouseParcels = async (req, res) => {
    try {
        const parcels = await Parcel.find({ warehouse: req.params.id });
        res.json(parcels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { assignDriver, getDrivers, getWarehouseParcels };

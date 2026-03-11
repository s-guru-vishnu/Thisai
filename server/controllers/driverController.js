const Parcel = require('../models/Parcel');

// @desc    Get driver's assigned parcels
// @route   GET /api/driver/parcels
// @access  Private/Driver
const getDriverParcels = async (req, res) => {
    try {
        const parcels = await Parcel.find({ assignedDriver: req.user._id });
        res.json(parcels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update parcel status
// @route   PUT /api/driver/parcels/:id/status
// @access  Private/Driver
const updateParcelStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const parcel = await Parcel.findOne({ _id: req.params.id, assignedDriver: req.user._id });
        if (parcel) {
            parcel.status = status;
            const updatedParcel = await parcel.save();
            res.json(updatedParcel);
        } else {
            res.status(404).json({ message: 'Parcel not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDriverParcels, updateParcelStatus };

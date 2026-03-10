const Parcel = require('../models/Parcel');

// @desc    Get customer's parcels
// @route   GET /api/customer/parcels
// @access  Private/Customer
const getCustomerParcels = async (req, res) => {
    try {
        const parcels = await Parcel.find({ customer: req.user._id });
        res.json(parcels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Track parcel
// @route   GET /api/customer/parcels/:id
// @access  Private/Customer
const trackParcel = async (req, res) => {
    try {
        const parcel = await Parcel.findOne({ _id: req.params.id, customer: req.user._id });
        if (parcel) {
            res.json(parcel);
        } else {
            res.status(404).json({ message: 'Parcel not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getCustomerParcels, trackParcel };

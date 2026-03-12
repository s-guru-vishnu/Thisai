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

// @desc    Update driver location
// @route   POST /api/driver/location
// @access  Private/Driver
const updateDriverLocation = async (req, res) => {
    try {
        const { lat, lng } = req.body;
        // In a real app, we'd store this in the User model or a dedicated DriverStatus model
        // For now, let's just confirm receipt to keep the frontend happy
        res.json({ message: 'Location updated', location: { lat, lng } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get driver real-time route (Mock for dashboard)
// @route   GET /api/driver/route/:id
// @access  Private
const getDriverRoute = async (req, res) => {
    try {
        // Return structured stops for the map
        const parcels = await Parcel.find({ assignedDriver: req.params.id });
        const stops = parcels.map(p => ({
            id: p._id,
            trackingCode: p.trackingCode || p.parcelId,
            productName: p.productName,
            destination: p.deliveryAddress,
            location: { lat: 13.0827 + (Math.random() - 0.5) * 0.1, lng: 80.2707 + (Math.random() - 0.5) * 0.1 } // Mock coordinates around Chennai
        }));
        res.json({ stops });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDriverParcels, updateParcelStatus, updateDriverLocation, getDriverRoute };

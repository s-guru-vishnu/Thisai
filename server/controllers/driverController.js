const Parcel = require('../models/Parcel');
const User = require('../models/User');
const { getCargoPath } = require('../utils/logisticsRoutes');

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
        const driver = await User.findById(req.params.id);
        if (!driver) return res.status(404).json({ message: 'Driver not found' });

        // Logic for Cargo Drivers (Hub-to-Hub)
        if (driver.role === 'cargo_driver') {
            // Determine start and end based on assigned hubs or preference
            // For now, we'll use a likely route if assignedHub exists, otherwise a default
            const startNode = driver.region === 'Northern Tamil Nadu' ? 'Chennai' : 
                             driver.region === 'Western Tamil Nadu' ? 'Coimbatore' :
                             driver.region === 'Southern Tamil Nadu' ? 'Madurai' :
                             driver.region === 'Central Tamil Nadu' ? 'Trichy' : 'Chennai';
            
            // Destination is usually another major hub in a different region
            const endNode = startNode === 'Chennai' ? 'Coimbatore' : 'Chennai';

            const stops = getCargoPath(startNode, endNode);
            return res.json({ stops });
        }

        // Default logic for standard/last-mile drivers
        const parcels = await Parcel.find({ assignedDriver: req.params.id });
        const stops = parcels.map(p => ({
            id: p._id,
            trackingCode: p.trackingCode || p.parcelId,
            productName: p.productName,
            destination: p.deliveryAddress,
            location: p.location?.latitude ? { lat: p.location.latitude, lng: p.location.longitude } : 
                     { lat: 13.0827 + (Math.random() - 0.5) * 0.1, lng: 80.2707 + (Math.random() - 0.5) * 0.1 }
        }));
        res.json({ stops });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDriverParcels, updateParcelStatus, updateDriverLocation, getDriverRoute };

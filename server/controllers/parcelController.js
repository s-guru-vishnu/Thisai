const Parcel = require('../models/Parcel');
const User = require('../models/User');
const Address = require('../models/Address');

// @desc    Create a new parcel
// @route   POST /api/parcels
// @access  Private (Parcel Receiver)
const createParcel = async (req, res) => {
    try {
        let { customer, customerName, deliveryAddress, destination } = req.body;
        
        // 1. Find Full Profiles
        const sellerProfile = await User.findById(req.user._id);
        if (!sellerProfile) {
            return res.status(404).json({ message: 'Seller profile not found' });
        }
        const customerProfile = await User.findById(customer);
        
        if (!customerProfile) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Safety fallback for destination
        if (!destination) {
            destination = customerProfile.location?.city || customerProfile.city || 'Chennai';
            req.body.destination = destination;
        }

        // 2. Determine Warehouses (Manual Specification Prioritized)
        const sellerAddr = await Address.findOne({ userId: sellerProfile._id }).sort({ isDefault: -1, createdAt: -1 });
        const customerAddr = await Address.findOne({ userId: customerProfile._id }).sort({ isDefault: -1, createdAt: -1 });

        let originWH = null;
        let destWH = null;

        // Resolve Origin Hub
        if (sellerAddr?.nearestHub) {
            const manualHub = await User.findById(sellerAddr.nearestHub);
            if (manualHub) {
                // If they picked a manager, find the warehouse in same hub city
                originWH = manualHub.role === 'warehouse' ? manualHub : await User.findOne({ role: 'warehouse', hub: manualHub.hub });
            }
        }
        
        if (!originWH) {
            originWH = await User.findOne({ 
                role: 'warehouse', 
                $or: [
                    { hub: sellerProfile?.hub },
                    { city: sellerProfile?.city },
                    { city: sellerAddr?.townCity },
                    { name: /Chennai/i }
                ]
            }).sort({ createdAt: 1 });
        }

        // Resolve Destination Hub
        if (customerAddr?.nearestHub) {
            const manualHub = await User.findById(customerAddr.nearestHub);
            if (manualHub) {
                destWH = manualHub.role === 'warehouse' ? manualHub : await User.findOne({ role: 'warehouse', hub: manualHub.hub });
            }
        }

        if (!destWH) {
            destWH = await User.findOne({ 
                role: 'warehouse', 
                $or: [
                    { city: destination },
                    { hub: customerProfile.hub },
                    { city: customerProfile.location?.city },
                    { city: customerAddr?.townCity },
                    { name: /Madurai/i }
                ]
            }).sort({ createdAt: 1 });
        }

        if (!originWH) {
            return res.status(400).json({ message: 'No suitable origin warehouse found. Please set your hub in profile.' });
        }
        if (!destWH) {
            return res.status(400).json({ message: 'No suitable destination warehouse found for this customer.' });
        }

        const originWarehouse = originWH;
        const destinationWarehouse = destWH;

        // 3. Automated Hub Routing (if regions differ)
        const intermediateHubs = [];
        if (originWarehouse.region && destinationWarehouse.region && originWarehouse.region !== destinationWarehouse.region) {
            // Find the hub warehouse for the origin region
            const originHub = await User.findOne({ 
                role: 'warehouse', 
                name: new RegExp(originWarehouse.hub, 'i'),
                region: originWarehouse.region
            });
            
            // Find the hub warehouse for the destination region
            const destHub = await User.findOne({ 
                role: 'warehouse', 
                name: new RegExp(destinationWarehouse.hub, 'i'),
                region: destinationWarehouse.region
            });

            if (originHub && originHub._id.toString() !== originWarehouse._id.toString()) {
                intermediateHubs.push(originHub._id);
            }
            if (destHub && destHub._id.toString() !== destinationWarehouse._id.toString()) {
                intermediateHubs.push(destHub._id);
            }
        }

        const parcelId = req.body.parcelId || `PRC-${Math.floor(10000 + Math.random() * 90000)}`;
        
        const newParcel = new Parcel({
            ...req.body,
            destination, // Ensure the resolved destination is used
            parcelId,
            seller: sellerProfile.name,
            customer: customerProfile._id,
            originWarehouse: originWarehouse._id,
            destinationWarehouse: destinationWarehouse._id,
            intermediateHubs: intermediateHubs,
            currentWarehouse: originWarehouse._id,
            status: req.body.status || 'Dispatched'
        });

        console.log('Attempting to save parcel with destination:', newParcel.destination);
        const savedParcel = await newParcel.save();
        console.log(`Parcel created successfully: ${parcelId}`);
        res.status(201).json(savedParcel);
    } catch (err) {
        console.error('Error in createParcel:', err);
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get all parcels
// @route   GET /api/parcels
// @access  Private
const getParcels = async (req, res) => {
    try {
        let query = {};
        
        // If user is a seller, only show their own parcels
        if (req.user && req.user.role === 'seller') {
            query.seller = req.user.name;
        }

        const parcels = await Parcel.find(query).sort({ createdAt: -1 });
        res.status(200).json(parcels);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Get parcel by ID
// @route   GET /api/parcels/:id
// @access  Private
const getParcelById = async (req, res) => {
    try {
        const parcel = await Parcel.findById(req.params.id);
        if (parcel) {
            res.json(parcel);
        } else {
            res.status(404).json({ message: 'Parcel not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Update parcel
// @route   PUT /api/parcels/:id
// @access  Private
const updateParcel = async (req, res) => {
    try {
        const parcel = await Parcel.findById(req.params.id);
        if (parcel) {
            const updatedParcel = await Parcel.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.json(updatedParcel);
        } else {
            res.status(404).json({ message: 'Parcel not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Delete parcel
// @route   DELETE /api/parcels/:id
// @access  Private
const deleteParcel = async (req, res) => {
    try {
        const parcel = await Parcel.findById(req.params.id);
        if (parcel) {
            await Parcel.findByIdAndDelete(req.params.id);
            res.json({ message: 'Parcel removed' });
        } else {
            res.status(404).json({ message: 'Parcel not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createParcel, getParcels, getParcelById, updateParcel, deleteParcel };
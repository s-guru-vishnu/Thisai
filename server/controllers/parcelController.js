const Parcel = require('../models/Parcel');

// @desc    Create a new parcel
// @route   POST /api/parcels
// @access  Private (Parcel Receiver)
const createParcel = async (req, res) => {
    try {
        const { customer, customerName, deliveryAddress, destination } = req.body;
        const seller = req.user; // Assuming req.user is populated by authentication middleware

        // 1. Find Customer Profile
        const customerProfile = await User.findById(customer);
        if (!customerProfile) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // 2. Determine Warehouses from explicit user preferences
        // Assuming seller.nearestWarehouse and customerProfile.nearestWarehouse store User IDs of warehouse roles
        const originWarehouse = await User.findById(seller.nearestWarehouse);
        const destinationWarehouse = await User.findById(customerProfile.nearestWarehouse);

        if (!originWarehouse || originWarehouse.role !== 'warehouse') {
            return res.status(400).json({ message: 'Seller\'s nearest warehouse not found or invalid.' });
        }
        if (!destinationWarehouse || destinationWarehouse.role !== 'warehouse') {
            return res.status(400).json({ message: 'Customer\'s nearest warehouse not found or invalid.' });
        }

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
            parcelId,
            seller: seller.name,
            customer: customerProfile._id,
            originWarehouse: originWarehouse._id,
            destinationWarehouse: destinationWarehouse._id,
            intermediateHubs: intermediateHubs,
            currentWarehouse: originWarehouse._id,
            status: req.body.status || 'Dispatched'
        });

        const savedParcel = await newParcel.save();
        res.status(201).json(savedParcel);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Get all parcels
// @route   GET /api/parcels
// @access  Private
const getParcels = async (req, res) => {
    try {
        const parcels = await Parcel.find().sort({ createdAt: -1 });
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
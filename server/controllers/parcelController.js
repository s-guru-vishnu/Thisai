const Parcel = require('../models/Parcel');

// @desc    Create a new parcel
// @route   POST /api/parcels
// @access  Private (Parcel Receiver)
const createParcel = async (req, res) => {
    try {
        const parcelId = `PRC-${Math.floor(10000 + Math.random() * 90000)}`;
        const newParcel = new Parcel({
            ...req.body,
            parcelId,
            status: 'Received'
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
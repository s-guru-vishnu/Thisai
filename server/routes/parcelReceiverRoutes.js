const express = require('express');
const router = express.Router();
const Parcel = require('../models/Parcel');

// Create a new parcel
router.post('/', async (req, res) => {
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
});

// Get all parcels
router.get('/', async (req, res) => {
    try {
        const parcels = await Parcel.find().sort({ createdAt: -1 });
        res.status(200).json(parcels);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

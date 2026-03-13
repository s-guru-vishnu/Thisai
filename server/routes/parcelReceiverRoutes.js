const express = require('express');
const router = express.Router();
const { createParcel, getParcels, getParcelById, updateParcel, deleteParcel } = require('../controllers/parcelController');
const { protect, checkLocation } = require('../middleware/authMiddleware');

// Create a new parcel
router.post('/', protect, createParcel);

// Get all parcels
router.get('/', getParcels);

// Get parcel by ID
router.get('/:id', getParcelById);

// Update parcel
router.put('/:id', updateParcel);

// Delete parcel
router.delete('/:id', deleteParcel);

module.exports = router;

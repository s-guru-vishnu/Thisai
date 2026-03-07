const express = require('express');
const router = express.Router();
const { createParcel, getParcels, getParcelById, updateParcel, deleteParcel } = require('../controllers/parcelController');

// Create a new parcel
router.post('/', createParcel);

// Get all parcels
router.get('/', getParcels);

// Get parcel by ID
router.get('/:id', getParcelById);

// Update parcel
router.put('/:id', updateParcel);

// Delete parcel
router.delete('/:id', deleteParcel);

module.exports = router;

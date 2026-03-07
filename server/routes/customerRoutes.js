const express = require('express');
const router = express.Router();
const { getCustomerParcels, trackParcel } = require('../controllers/customerController');

// Get customer's parcels
router.get('/parcels', getCustomerParcels);

// Track parcel
router.get('/parcels/:id', trackParcel);

module.exports = router;

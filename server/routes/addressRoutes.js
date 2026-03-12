const express = require('express');
const router = express.Router();
const { addAddress, getAddresses, updateAddress, deleteAddress } = require('../controllers/addressController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, addAddress)
    .get(protect, getAddresses);

router.route('/:id')
    .put(protect, updateAddress)
    .delete(protect, deleteAddress);

module.exports = router;

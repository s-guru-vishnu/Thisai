const Address = require('../models/Address');
const User = require('../models/User');

// @desc    Add a new address
// @route   POST /api/address
// @access  Private
const addAddress = async (req, res) => {
    try {
        console.log('--- RESTART VERIFIED: addAddress called ---');
        console.log('Payload:', JSON.stringify(req.body, null, 2));
        const payload = { ...req.body };
        if (payload.nearestHub === '') delete payload.nearestHub;

        const address = new Address({
            ...payload,
            userId: req.user._id
        });

        const createdAddress = await address.save();
        console.log('Address saved with ID:', createdAddress._id);

        // Sync to User location if it's the first/default address
        if (createdAddress.isDefault) {
            await User.findByIdAndUpdate(req.user._id, {
                location: {
                    addressLine1: createdAddress.area,
                    city: createdAddress.townCity,
                    state: createdAddress.state,
                    country: createdAddress.country,
                    postalCode: createdAddress.pincode,
                    latitude: createdAddress.latitude,
                    longitude: createdAddress.longitude
                },
                nearestWarehouse: createdAddress.nearestHub
            });
        }

        res.status(201).json(createdAddress);
    } catch (error) {
        console.error('Error in addAddress:', error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all addresses for a user
// @route   GET /api/address
// @access  Private
const getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ userId: req.user._id })
            .populate('nearestHub', 'name hub city')
            .sort({ isDefault: -1, createdAt: -1 });
        res.json(addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update an address
// @route   PUT /api/address/:id
// @access  Private
const updateAddress = async (req, res) => {
    try {
        const address = await Address.findById(req.params.id);

        if (address) {
            if (address.userId.toString() !== req.user._id.toString()) {
                res.status(401);
                throw new Error('Not authorized');
            }

            // Update fields
            Object.keys(req.body).forEach(key => {
                if (key !== 'userId') {
                    if (key === 'nearestHub' && req.body[key] === '') {
                        address[key] = undefined;
                    } else {
                        address[key] = req.body[key];
                    }
                }
            });

            const updatedAddress = await address.save();
            await updatedAddress.populate('nearestHub', 'name hub city');

            // Sync to User location if it's set as default
            if (updatedAddress.isDefault) {
                await User.findByIdAndUpdate(req.user._id, {
                    location: {
                        addressLine1: updatedAddress.area,
                        city: updatedAddress.townCity,
                        state: updatedAddress.state,
                        country: updatedAddress.country,
                        postalCode: updatedAddress.pincode,
                        latitude: updatedAddress.latitude,
                        longitude: updatedAddress.longitude
                    },
                    nearestWarehouse: updatedAddress.nearestHub
                });
            }

            res.json(updatedAddress);
        } else {
            res.status(404);
            throw new Error('Address not found');
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete an address
// @route   DELETE /api/address/:id
// @access  Private
const deleteAddress = async (req, res) => {
    try {
        const address = await Address.findById(req.params.id);

        if (address) {
            if (address.userId.toString() !== req.user._id.toString()) {
                res.status(401);
                throw new Error('Not authorized');
            }

            await address.deleteOne();
            res.json({ message: 'Address removed' });
        } else {
            res.status(404);
            throw new Error('Address not found');
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    addAddress,
    getAddresses,
    updateAddress,
    deleteAddress
};

const Address = require('../models/Address');

// @desc    Add a new address
// @route   POST /api/address
// @access  Private
const addAddress = async (req, res) => {
    try {
        const address = new Address({
            ...req.body,
            userId: req.user._id
        });

        const createdAddress = await address.save();
        res.status(201).json(createdAddress);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all addresses for a user
// @route   GET /api/address
// @access  Private
const getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ userId: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
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
                    address[key] = req.body[key];
                }
            });

            const updatedAddress = await address.save();
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

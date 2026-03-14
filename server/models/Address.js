const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    fullName: {
        type: String,
        default: 'My Address'
    },
    phone: {
        type: String
    },
    pincode: {
        type: String
    },
    houseNumber: {
        type: String
    },
    area: {
        type: String
    },
    landmark: {
        type: String
    },
    townCity: {
        type: String
    },
    state: {
        type: String
    },
    country: {
        type: String,
        required: true,
        default: 'India'
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    },
    addressType: {
        type: String,
        enum: ['House', 'Apartment', 'Business', 'Other'],
        default: 'House'
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    deliveryInstructions: {
        type: String
    },
    deliverySchedule: {
        type: String,
        enum: ['Weekdays', 'Weekends', 'Both'],
        default: 'Both'
    },
    nearestHub: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Ensure only one default address per user
addressSchema.pre('save', async function(next) {
    if (this.isDefault) {
        await this.constructor.updateMany(
            { userId: this.userId, _id: { $ne: this._id } },
            { $set: { isDefault: false } }
        );
    }
    next();
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;

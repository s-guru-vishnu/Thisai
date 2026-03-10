const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true,
            enum: ['admin', 'manager', 'warehouse', 'driver', 'customer', 'parcel_receiver', 'seller'],
            default: 'customer',
        },
    },
    {
        timestamps: true,
    }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
    // Simple check for demo purposes, could use bcrypt
    return enteredPassword === this.password;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

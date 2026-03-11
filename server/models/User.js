const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
        phone: {
            type: String,
            default: '',
        },
        avatar: {
            type: String,
            default: '',
        },
        timezone: {
            type: String,
            default: 'UTC',
        },
        preferences: {
            theme: { type: String, default: 'system' },
            accentColor: { type: String, default: 'default' }
        },
        security: {
            twoFactorEnabled: { type: Boolean, default: false },
            activeSessions: { type: Array, default: [] }
        },
        // Basic Info - Business
        companyName: { type: String, default: '' },
        companyType: { type: String, default: '' },
        businessAddress: { type: String, default: '' },
        warehouseLocation: { type: String, default: '' },
        country: { type: String, default: '' },
        city: { type: String, default: '' },
        taxId: { type: String, default: '' },

        // Logistics Preferences
        logisticsPreferences: {
            primaryRegion: { type: String, default: '' },
            transportType: { type: String, default: '' },
            fleetSize: { type: String, default: '' },
            operatingHours: { type: String, default: '' },
        },
        
        // Operational Details
        operationalDetails: {
            averageDelivery: { type: String, default: '' },
            warehouseCapacity: { type: String, default: '' },
            deliveryZones: { type: String, default: '' },
            serviceType: { type: String, default: '' }
        },

        // Platform Integrations
        platforms: {
            ecommerce: [{
                name: String,
                accountId: String,
                status: { type: String, enum: ['Connected', 'Not Connected', 'Error'], default: 'Not Connected' }
            }],
            logistics: [{
                name: String,
                apiKey: String,
                webhook: String,
                status: { type: String, enum: ['Connected', 'Not Connected', 'Error'], default: 'Not Connected' }
            }]
        },

        // Visibility
        visibility: {
            publicProfile: { type: Boolean, default: false },
            showStats: { type: Boolean, default: false },
            showIntegrations: { type: Boolean, default: false },
            allowPartnerRequests: { type: Boolean, default: false },
            allowDriverApplications: { type: Boolean, default: false },
            partnerAccess: { type: Boolean, default: false }
        }
    },
    {
        timestamps: true,
    }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;

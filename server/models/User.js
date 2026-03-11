const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const generateUserId = () => {
    const chars = "0123456789";
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let id = "";
    for(let i = 0; i < 4; i++)
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    for(let i = 0; i < 4; i++)
        id += letters.charAt(Math.floor(Math.random() * letters.length));
    return id;
};

const locationSchema = mongoose.Schema({
    addressLine1: { type: String, default: '' },
    addressLine2: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
}, { _id: false });

const userSchema = mongoose.Schema(
    {
        userId: {
            type: String,
            unique: true
        },
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
        phone: { type: String, default: '' },
        avatar: { type: String, default: '' },
        timezone: { type: String, default: 'UTC' },
        country: { type: String, default: '' },
        city: { type: String, default: '' },
        
        preferences: {
            theme: { type: String, default: 'system' },
            accentColor: { type: String, default: 'default' }
        },
        security: {
            twoFactorEnabled: { type: Boolean, default: false },
            activeSessions: { type: Array, default: [] }
        },

        // Admin Fields
        companyName: { type: String, default: '' },
        companyType: { type: String, default: '' },
        headOfficeAddress: { type: String, default: '' },
        totalWarehouses: { type: Number, default: 0 },
        totalDrivers: { type: Number, default: 0 },
        businessRegistrationNumber: { type: String, default: '' },

        // Manager Fields
        assignedWarehouse: { type: String, default: '' },
        teamSize: { type: Number, default: 0 },
        deliveryRegion: { type: String, default: '' },
        operatingShift: { type: String, default: '' },
        department: { type: String, default: '' },

        // Driver Fields
        driverLicenseNumber: { type: String, default: '' },
        vehicleType: { type: String, default: '' },
        vehicleNumber: { type: String, default: '' },
        yearsOfExperience: { type: Number, default: 0 },
        assignedHub: { type: String, default: '' },
        workingShift: { type: String, default: '' },

        // Customer Fields
        defaultDeliveryAddress: { type: String, default: '' },
        preferredDeliveryTime: { type: String, default: '' },
        contactPreference: { type: String, default: 'Email' },
        orderNotifications: { type: Boolean, default: true },

        // Receiver Fields
        receiverAddress: { type: String, default: '' },
        alternateContactNumber: { type: String, default: '' },
        deliveryInstructions: { type: String, default: '' },

        // Seller Fields
        storeName: { type: String, default: '' },
        businessType: { type: String, default: '' },
        warehouseLocation: { type: String, default: '' },
        averageDailyOrders: { type: Number, default: 0 },
        returnAddress: { type: String, default: '' },
        gstNumber: { type: String, default: '' },

        // Location Data Object
        location: {
            type: locationSchema,
            default: () => ({})
        },

        // Driver Specific
        liveLocationSharing: { type: Boolean, default: false },

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

        // Visibility Controls
        visibility: {
            publicProfile: { type: Boolean, default: false },
            showStats: { type: Boolean, default: false },
            showIntegrations: { type: Boolean, default: false },
            allowPartnerRequests: { type: Boolean, default: false },
            allowDriverApplications: { type: Boolean, default: false },
            partnerAccess: { type: Boolean, default: false },
            allowJobOffers: { type: Boolean, default: false },
            allowMarketplaceSync: { type: Boolean, default: false }
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
    // Generate userId if it doesn't exist
    if (!this.userId) {
        let isUnique = false;
        while (!isUnique) {
            const newId = generateUserId();
            const existingUser = await mongoose.models.User.findOne({ userId: newId });
            if (!existingUser) {
                this.userId = newId;
                isUnique = true;
            }
        }
    }

    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;

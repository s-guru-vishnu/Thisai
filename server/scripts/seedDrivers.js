require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const driversData = [
    {
        name: 'Western Region Driver',
        email: 'driver.west@logistics.com',
        password: 'password123',
        role: 'driver',
        region: 'Western Tamil Nadu',
        hub: 'Coimbatore'
    },
    {
        name: 'Northern Region Driver',
        email: 'driver.north@logistics.com',
        password: 'password123',
        role: 'driver',
        region: 'Northern Tamil Nadu',
        hub: 'Chennai'
    },
    {
        name: 'Central Region Driver',
        email: 'driver.central@logistics.com',
        password: 'password123',
        role: 'driver',
        region: 'Central Tamil Nadu',
        hub: 'Trichy'
    },
    {
        name: 'Southern Region Driver',
        email: 'driver.south@logistics.com',
        password: 'password123',
        role: 'driver',
        region: 'Southern Tamil Nadu',
        hub: 'Madurai'
    },
    {
        name: 'Coastal South Driver',
        email: 'driver.coastal@logistics.com',
        password: 'password123',
        role: 'driver',
        region: 'Coastal South',
        hub: 'Tirunelveli'
    }
];

const seedDrivers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/logist');
        console.log('Connected to MongoDB for driver seeding...');

        for (const driver of driversData) {
            const exists = await User.findOne({ email: driver.email });
            if (!exists) {
                await User.create(driver);
                console.log(`Created driver: ${driver.name} (${driver.region})`);
            } else {
                console.log(`Driver already exists: ${driver.email}`);
            }
        }

        console.log('Driver seeding completed.');
        process.exit();
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedDrivers();

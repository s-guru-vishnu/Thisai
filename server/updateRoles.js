const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const updateRegionalDrivers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const emails = [
            'driver.west@logistics.com',
            'driver.north@logistics.com',
            'driver.central@logistics.com',
            'driver.south@logistics.com',
            'driver.coastal@logistics.com'
        ];

        const result = await User.updateMany(
            { email: { $in: emails } },
            { $set: { role: 'cargo_driver' } }
        );

        console.log(`Successfully updated ${result.modifiedCount} drivers to CARGO DRIVER role.`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

updateRegionalDrivers();

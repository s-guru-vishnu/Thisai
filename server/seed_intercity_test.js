const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./models/User');
const Parcel = require('./models/Parcel');
const Warehouse = require('./models/Warehouse');

async function seedVelloreChennai() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        // 1. Create/Find the Arcot Warehouse
        let warehouse = await Warehouse.findOne({ name: "Arcot Distribution Hub" });
        if (!warehouse) {
            warehouse = await Warehouse.create({
                name: "Arcot Distribution Hub",
                location: "Arcot, Ranipet District",
                latitude: 12.8973,
                longitude: 79.3308,
                capacity: 5000
            });
        } else {
            // Update existing for the test
            warehouse.latitude = 12.8973;
            warehouse.longitude = 79.3308;
            await warehouse.save();
        }

        // 2. Setup Test Driver in Vellore
        const driverId = new mongoose.Types.ObjectId("65f123456789012345678901");
        let driver = await User.findById(driverId);
        if (!driver) {
            driver = await User.create({
                _id: driverId,
                name: "Intra-State Driver",
                email: "driver@test.com",
                password: "password123",
                role: "driver"
            });
        }
        
        driver.location = {
            addressLine1: "Vellore City Office",
            latitude: 12.9165,
            longitude: 79.1325
        };
        await driver.save();

        // 3. Setup Delivery Stop in Anna Nagar, Chennai
        const customerId = new mongoose.Types.ObjectId("65f987654321098765432109");
        
        const parcelData = {
            parcelId: "CHN-AN-001",
            productName: "Premium Electronics",
            category: "Electronics",
            weight: "5kg",
            seller: "Global Tech",
            destination: "Chennai",
            customer: customerId,
            customerName: "Chennai Customer",
            deliveryType: "Express",
            status: "Assigned",
            assignedDriver: driverId,
            warehouse: warehouse._id,
            deliveryAddress: "Anna Nagar, Chennai",
            latitude: 13.0850,
            longitude: 80.2101
        };

        await Parcel.deleteMany({ assignedDriver: driverId });
        await Parcel.create(parcelData);

        console.log("SEED_SUCCESS: Vellore -> Arcot -> Anna Nagar");
        console.log("Driver ID: " + driverId);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedVelloreChennai();

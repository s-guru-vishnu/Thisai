const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./models/User');
const Parcel = require('./models/Parcel');
const Warehouse = require('./models/Warehouse');

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        // 1. Create/Find a Test Warehouse
        let warehouse = await Warehouse.findOne({ name: "Vellore Hub" });
        if (!warehouse) {
            warehouse = await Warehouse.create({
                name: "Vellore Hub",
                location: "Sathuvachari, Vellore",
                latitude: 12.9516,
                longitude: 79.1568,
                capacity: 1000
            });
        }

        // 2. Create a Test Driver/Customer
        const driverId = new mongoose.Types.ObjectId("65f123456789012345678901");
        const customerId = new mongoose.Types.ObjectId("65f987654321098765432109");
        
        let driver = await User.findById(driverId);
        if (!driver) {
            driver = await User.create({
                _id: driverId,
                name: "Test Driver",
                email: "driver@test.com",
                password: "password123",
                role: "driver",
                location: {
                    addressLine1: "Bagayam, Vellore",
                    latitude: 12.8950,
                    longitude: 79.1330
                }
            });
        }

        // 3. Create 3 Test Parcels
        const commonData = {
            weight: "2kg",
            seller: "Amazon",
            destination: "Vellore",
            customer: customerId,
            customerName: "JD",
            deliveryType: "Standard",
            status: "Assigned",
            assignedDriver: driverId,
            warehouse: warehouse._id
        };

        const parcelsData = [
            {
                ...commonData,
                parcelId: "TRK-001",
                productName: "Electronics Case",
                category: "Electronics",
                deliveryAddress: "Vellore Fort Area",
                latitude: 12.9270,
                longitude: 79.1333
            },
            {
                ...commonData,
                parcelId: "TRK-002",
                productName: "Books Bundle",
                category: "Standard",
                deliveryAddress: "Katpadi Junction Area",
                latitude: 12.9680,
                longitude: 79.1320
            },
            {
                ...commonData,
                parcelId: "TRK-003",
                productName: "Laptop Charger",
                category: "Electronics",
                deliveryAddress: "Sathuvachari Phase 2",
                latitude: 12.9450,
                longitude: 79.1600
            }
        ];

        await Parcel.deleteMany({ assignedDriver: driverId });
        await Parcel.insertMany(parcelsData);

        console.log("SEED_SUCCESS:" + driverId);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();

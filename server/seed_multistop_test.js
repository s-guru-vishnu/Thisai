const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./models/User');
const Parcel = require('./models/Parcel');
const Warehouse = require('./models/Warehouse');

async function seedMultiStop() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        // 1. Arcot Warehouse
        let warehouse = await Warehouse.findOne({ name: "Arcot Distribution Hub" });
        if (!warehouse) {
            warehouse = await Warehouse.create({
                name: "Arcot Distribution Hub",
                location: "Arcot, Ranipet District",
                latitude: 12.8973,
                longitude: 79.3308,
                capacity: 5000
            });
        }

        // 2. Driver in Vellore
        const driverId = new mongoose.Types.ObjectId("65f123456789012345678901");
        await User.findByIdAndUpdate(driverId, {
            location: {
                addressLine1: "Vellore City Office",
                latitude: 12.9165,
                longitude: 79.1325
            }
        }, { upsert: true });

        // 3. 4 Delivery Stops in Chennai
        const customerId = new mongoose.Types.ObjectId("65f987654321098765432109");
        const stops = [
            {
                parcelId: "CHN-AN-001",
                productName: "Premium Electronics",
                deliveryAddress: "Anna Nagar, Chennai",
                latitude: 13.0850,
                longitude: 80.2101,
                category: "Electronics"
            },
            {
                parcelId: "CHN-TN-002",
                productName: "Fashion Apparels",
                deliveryAddress: "T. Nagar, Chennai",
                latitude: 13.0418,
                longitude: 80.2341,
                category: "Standard"
            },
            {
                parcelId: "CHN-AD-003",
                productName: "Home Appliances",
                deliveryAddress: "Adyar, Chennai",
                latitude: 13.0012,
                longitude: 80.2565,
                category: "Standard"
            },
            {
                parcelId: "CHN-MR-004",
                productName: "Books Collection",
                deliveryAddress: "Marina Beach Area",
                latitude: 13.0500,
                longitude: 80.2824,
                category: "Standard"
            }
        ];

        const commonData = {
            weight: "5kg",
            seller: "Global Tech",
            destination: "Chennai",
            customer: customerId,
            customerName: "Chennai Customer",
            deliveryType: "Express",
            status: "Assigned",
            assignedDriver: driverId,
            warehouse: warehouse._id
        };

        await Parcel.deleteMany({ assignedDriver: driverId });
        await Parcel.insertMany(stops.map(s => ({ ...commonData, ...s })));

        console.log("SEED_SUCCESS: Vellore -> Arcot -> 4 Chennai Stops");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedMultiStop();

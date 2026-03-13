const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Parcel = require('./models/Parcel');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const parcels = await Parcel.find({}).lean();
        console.log("TOTAL_PARCELS:" + parcels.length);
        parcels.forEach(p => {
            console.log(`Parcel: ${p.parcelId}, Driver: ${p.assignedDriver}, Status: ${p.status}`);
        });
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function findDriver() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const parcel = await mongoose.connection.db.collection('parcels').findOne({ status: { $ne: 'Delivered' } });
        if (parcel) {
            console.log(parcel.assignedDriver);
        } else {
            console.log('NONE');
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findDriver();

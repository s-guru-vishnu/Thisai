const mongoose = require('mongoose');
const path = require('path');
const Parcel = require('./server/models/Parcel');
const User = require('./server/models/User');
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

async function fixParcels() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tn_impact');
        console.log('Connected to DB');

        const problematicParcels = await Parcel.find({ 
            $or: [
                { customer: { $exists: false } },
                { customer: null }
            ]
        });

        console.log(`Found ${problematicParcels.length} parcels missing customer.`);

        if (problematicParcels.length > 0) {
            const defaultCustomer = await User.findOne({ role: 'customer' });
            if (!defaultCustomer) {
                console.log('No default customer found to assign. Create one first.');
                process.exit(1);
            }

            console.log(`Assigning customer ${defaultCustomer.email} to ${problematicParcels.length} parcels.`);
            
            for (const p of problematicParcels) {
                // Use updateOne to bypass schema requirements if we just want to patch
                await Parcel.updateOne(
                    { _id: p._id },
                    { $set: { customer: defaultCustomer._id } }
                );
            }
            console.log('Patch complete.');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixParcels();

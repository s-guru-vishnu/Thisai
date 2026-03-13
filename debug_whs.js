const User = require('./server/models/User');
const Address = require('./server/models/Address');
const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const count = await User.countDocuments({ role: { $in: ['warehouse', 'manager'] } });
    console.log('Warehouse Count:', count);
    
    if (count > 0) {
        const sample = await User.findOne({ role: { $in: ['warehouse', 'manager'] } });
        console.log('Sample WH:', sample.name, sample.hub, sample.city);
    }

    const felix = await User.findOne({ email: 'felixjonus07@gmail.com' });
    if (felix) {
        console.log('Felix:', felix.name, felix.location);
        const addr = await Address.findOne({ userId: felix._id });
        console.log('Felix Address:', addr ? addr.townCity : 'None');
    }

    process.exit(0);
}

run().catch(console.error);

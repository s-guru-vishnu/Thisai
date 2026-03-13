const mongoose = require('mongoose');
const User = require('./server/models/User');
require('dotenv').config({ path: './server/.env' });

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/thisai_db");
        const users = await User.find({ role: { $in: ['manager', 'warehouse'] } });
        console.log(JSON.stringify(users.map(u => ({ name: u.name, role: u.role, hub: u.hub, city: u.city, region: u.region })), null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkDB();

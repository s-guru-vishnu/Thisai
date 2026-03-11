const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../server/models/User');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const check = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/logist';
        await mongoose.connect(uri);
        const users = await User.find({}, 'email userId _id');
        console.log('User Data:');
        users.forEach(u => console.log(`${u.email}: userId=${u.userId}, _id=${u._id}`));
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

check();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../server/models/User');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const generateUserId = () => {
    const chars = "0123456789";
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let id = "";
    for(let i = 0; i < 4; i++)
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    for(let i = 0; i < 4; i++)
        id += letters.charAt(Math.floor(Math.random() * letters.length));
    return id;
};

const migrate = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/logist';
        console.log(`Connecting to ${uri}...`);
        await mongoose.connect(uri);
        console.log('MongoDB Connected...');

        // Find ALL users to recreate their IDs
        const users = await User.find({});
        console.log(`Regenerating IDs for ${users.length} users.`);

        for (const user of users) {
            let isUnique = false;
            let newId;
            while (!isUnique) {
                newId = generateUserId();
                const existing = await User.findOne({ userId: newId });
                if (!existing) isUnique = true;
            }
            user.userId = newId;
            await user.save();
            console.log(`Updated user ${user.email} with NEW fixed userId ${newId}`);
        }

        console.log('Migration with fixed algorithm completed successfully.');
        process.exit();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();

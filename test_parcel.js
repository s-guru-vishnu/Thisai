const mongoose = require('mongoose');
const path = require('path');
const User = require('./server/models/User');
const Parcel = require('./server/models/Parcel');
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

async function testCreateParcel() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tn_impact');
        console.log('Connected to DB');

        // Find a customer and a seller
        const seller = await User.findOne({ role: 'seller' });
        const customer = await User.findOne({ role: 'customer' });

        if (!seller || !customer) {
            console.log('No seller/customer found. Create them first.');
            process.exit(1);
        }

        console.log('Using Seller:', seller.email, seller._id);
        console.log('Using Customer:', customer.email, customer._id);

        const parcelData = {
            parcelId: `TEST-${Date.now()}`,
            productName: 'Test Product',
            category: 'Testing',
            weight: '1kg',
            deliveryAddress: 'Test Address',
            destination: 'Test City',
            deliveryType: 'Standard',
            customerName: 'Test Customer'
        };

        const newParcel = new Parcel({
            ...parcelData,
            customer: customer._id,
            seller: seller.name
        });

        console.log('Creating parcel with customer:', newParcel.customer);
        await newParcel.save();
        console.log('SUCCESS: Parcel created');
        process.exit(0);
    } catch (err) {
        console.error('FAILURE:', err.message);
        process.exit(1);
    }
}

testCreateParcel();

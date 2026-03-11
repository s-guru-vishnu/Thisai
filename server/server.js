const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { protect, authorize } = require('./middleware/authMiddleware');

dotenv.config({ path: path.join(__dirname, '.env') });
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Import Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const customerRoutes = require('./routes/customerRoutes');
const driverRoutes = require('./routes/driverRoutes');
const managerRoutes = require('./routes/managerRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const parcelReceiverRoutes = require('./routes/parcelReceiverRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', protect, authorize('admin'), adminRoutes);
app.use('/api/customer', protect, authorize('customer'), customerRoutes);
app.use('/api/driver', protect, authorize('driver'), driverRoutes);
app.use('/api/manager', protect, authorize('manager'), managerRoutes);
app.use('/api/warehouse', protect, authorize('warehouse'), warehouseRoutes);
app.use('/api/parcels', protect, parcelReceiverRoutes); // Assuming parcel receiver can access

app.get('/', (req, res) => {
    res.send('Logistics API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
// End of file

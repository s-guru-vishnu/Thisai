const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { protect, authorize } = require('./middleware/authMiddleware');

dotenv.config({ path: path.join(__dirname, '.env') });
connectDB();

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, curl)
        if (!origin) return callback(null, true);
        const allowed = [
            'https://thisai-logistics.vercel.app',
            'http://localhost:5173',
            'http://localhost:3000',
            'http://localhost:5005',
        ];
        // Also allow any vercel.app preview deployments
        if (allowed.includes(origin) || /\.vercel\.app$/.test(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
// Handle pre-flight across all routes
app.options('*', cors(corsOptions));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const customerRoutes = require('./routes/customerRoutes');
const driverRoutes = require('./routes/driverRoutes');
const managerRoutes = require('./routes/managerRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const parcelReceiverRoutes = require('./routes/parcelReceiverRoutes');
const parcelRoutes = require('./routes/parcelRoutes');
const predictRoutes = require('./routes/predictRoutes');
const addressRoutes = require('./routes/addressRoutes');
const logisticsRoutes = require('./routes/logisticsRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Mount Routes

app.use('/api/auth', authRoutes);
app.use('/api/admin', protect, authorize('admin'), adminRoutes);
app.use('/api/customer', protect, authorize('customer'), customerRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/manager', protect, authorize('manager'), managerRoutes);
app.use('/api/warehouse', protect, authorize('warehouse'), warehouseRoutes);
app.use('/api/parcels', protect, parcelReceiverRoutes);
app.use('/api/parcel', parcelRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/predict', predictRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/logistics', logisticsRoutes);

app.get('/', (req, res) => {
    res.send('Logistics API is running...');
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' || process.env.RUN_LOCAL === 'true') {
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
}

// Export the app for Vercel serverless deployment
module.exports = app;

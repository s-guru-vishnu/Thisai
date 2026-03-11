import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';

// Import newly created independent routing modules
import AdminRoutes from './routes/adminRoutes';
import ManagerRoutes from './routes/managerRoutes';
import DriverRoutes from './routes/driverRoutes';
import CustomerRoutes from './routes/customerRoutes';
import ParcelReceiverRoutes from './routes/parcelReceiverRoutes';
import SellerRoutes from './routes/sellerRoutes';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />

                {/* Role-based Independent Routers */}
                <Route path="/dashboard/*" element={<AdminRoutes />} />
                <Route path="/manager/*" element={<ManagerRoutes />} />
                <Route path="/driver/*" element={<DriverRoutes />} />
                <Route path="/customer/*" element={<CustomerRoutes />} />
                <Route path="/receiver/*" element={<ParcelReceiverRoutes />} />
                <Route path="/seller/*" element={<SellerRoutes />} />
            </Routes>
        </Router>
    );
}

export default App;

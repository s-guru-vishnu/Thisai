import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ParcelReceiverDashboard from '../dashboards/ParcelReceiverDashboard';

const ParcelReceiverRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<ParcelReceiverDashboard />} />
            {/* Add more receiver-specific routes here */}
        </Routes>
    );
};

export default ParcelReceiverRoutes;

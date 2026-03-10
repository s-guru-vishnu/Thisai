import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ParcelReceiverDashboard from '../dashboards/ParcelReceiverDashboard';
import ReceiverScanner from '../dashboards/ReceiverScanner';
import ReceiverManualEntry from '../dashboards/ReceiverManualEntry';

const ParcelReceiverRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<ParcelReceiverDashboard />} />
            <Route path="/scan" element={<ReceiverScanner />} />
            <Route path="/manual" element={<ReceiverManualEntry />} />
            {/* Add more receiver-specific routes here */}
        </Routes>
    );
};

export default ParcelReceiverRoutes;

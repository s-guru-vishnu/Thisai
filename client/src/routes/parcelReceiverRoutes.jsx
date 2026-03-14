import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ParcelReceiverDashboard from '../dashboards/ParcelReceiverDashboard';
import ReceiverScanner from '../dashboards/ReceiverScanner';
import ReceiverManualEntry from '../dashboards/ReceiverManualEntry';
import NotFoundPage from '../pages/NotFoundPage';

const ParcelReceiverRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<ParcelReceiverDashboard />} />
            <Route path="/scan" element={<ReceiverScanner />} />
            <Route path="/manual" element={<ReceiverManualEntry />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

export default ParcelReceiverRoutes;

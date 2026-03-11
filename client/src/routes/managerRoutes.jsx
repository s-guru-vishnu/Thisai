import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ManagerDashboard from '../dashboards/ManagerDashboard';
import ReceiverScanner from '../dashboards/ReceiverScanner';
import ReceiverManualEntry from '../dashboards/ReceiverManualEntry';

const ManagerRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<ManagerDashboard />} />
            <Route path="/scan" element={<ReceiverScanner />} />
            <Route path="/manual" element={<ReceiverManualEntry />} />
            {/* Add more manager-specific routes here */}
        </Routes>
    );
};

export default ManagerRoutes;

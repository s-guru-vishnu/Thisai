import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ManagerDashboard from '../dashboards/ManagerDashboard';
import ReceiverScanner from '../dashboards/ReceiverScanner';
import ReceiverManualEntry from '../dashboards/ReceiverManualEntry';

import UserManagement from '../dashboards/UserManagement';
import NotFoundPage from '../pages/NotFoundPage';

const ManagerRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<ManagerDashboard />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/scan" element={<ReceiverScanner />} />
            <Route path="/manual" element={<ReceiverManualEntry />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

export default ManagerRoutes;

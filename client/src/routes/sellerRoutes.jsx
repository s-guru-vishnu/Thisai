import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SellerDashboard from '../dashboards/SellerDashboard';
import SellerDeliveries from '../dashboards/SellerDeliveries';
import SellerManualEntry from '../dashboards/SellerManualEntry';
import NotFoundPage from '../pages/NotFoundPage';

const SellerRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<SellerDashboard />} />
            <Route path="/deliveries" element={<SellerDeliveries />} />
            <Route path="/dispatch" element={<SellerManualEntry />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

export default SellerRoutes;

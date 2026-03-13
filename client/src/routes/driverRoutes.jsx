import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CargoDriverDashboard from '../dashboards/CargoDriverDashboard';
import DeliveryDriverDashboard from '../dashboards/DeliveryDriverDashboard';
import DriverDashboard from '../dashboards/DriverDashboard';

const DriverRoutes = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const role = userInfo.role;

    const renderDashboard = () => {
        if (role === 'cargo_driver') return <CargoDriverDashboard />;
        if (role === 'delivery_driver') return <DeliveryDriverDashboard />;
        return <DriverDashboard />;
    };

    return (
        <Routes>
            <Route path="/" element={renderDashboard()} />
            {/* Add more driver-specific routes here */}
        </Routes>
    );
};

export default DriverRoutes;

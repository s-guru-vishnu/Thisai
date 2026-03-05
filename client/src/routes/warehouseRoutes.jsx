import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WarehouseDashboard from '../dashboards/WarehouseDashboard';

const WarehouseRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<WarehouseDashboard />} />
            {/* Add more warehouse-specific routes here */}
        </Routes>
    );
};

export default WarehouseRoutes;

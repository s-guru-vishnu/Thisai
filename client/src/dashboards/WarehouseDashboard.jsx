import React from 'react';
import Navbar from '../components/Navbar';

const WarehouseDashboard = () => (
    <div className="app-container">
        <Navbar />
        <main className="main-content">
            <header className="dashboard-header">
                <div>
                    <h1>Warehouse <span>Operations</span></h1>
                    <p className="subtitle">Inventory, sorting and dispatch management.</p>
                </div>
            </header>
        </main>
    </div>
);

export default WarehouseDashboard;

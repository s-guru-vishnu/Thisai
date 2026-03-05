import React from 'react';
import Navbar from '../components/Navbar';

const DriverDashboard = () => (
    <div className="app-container">
        <Navbar />
        <main className="main-content">
            <header className="dashboard-header">
                <div>
                    <h1>Driver <span>Hub</span></h1>
                    <p className="subtitle">My routes, deliveries and schedules.</p>
                </div>
            </header>
        </main>
    </div>
);

export default DriverDashboard;

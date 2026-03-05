import React from 'react';
import Navbar from '../components/Navbar';

const ManagerDashboard = () => (
    <div className="app-container">
        <Navbar />
        <main className="main-content">
            <header className="dashboard-header">
                <div>
                    <h1>Manager <span>Portal</span></h1>
                    <p className="subtitle">Operational statistics and team overview.</p>
                </div>
            </header>
        </main>
    </div>
);

export default ManagerDashboard;

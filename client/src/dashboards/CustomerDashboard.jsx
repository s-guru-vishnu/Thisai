import React from 'react';
import Navbar from '../components/Navbar';

const CustomerDashboard = () => (
    <div className="app-container">
        <Navbar />
        <main className="main-content">
            <header className="dashboard-header">
                <div>
                    <h1>Client <span>Dashboard</span></h1>
                    <p className="subtitle">Track your shipments and orders.</p>
                </div>
            </header>
        </main>
    </div>
);

export default CustomerDashboard;

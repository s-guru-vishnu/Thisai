import React from 'react';
import Navbar from '../components/Navbar';

const ParcelReceiverDashboard = () => (
    <div className="app-container">
        <Navbar />
        <main className="main-content">
            <header className="dashboard-header">
                <div>
                    <h1>Receiver <span>Portal</span></h1>
                    <p className="subtitle">Manage incoming parcels and deliveries.</p>
                </div>
            </header>
        </main>
    </div>
);

export default ParcelReceiverDashboard;

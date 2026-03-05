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
            <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-panel)', borderRadius: '16px', border: '1px dashed var(--border-accent)', marginTop: '2rem' }}>
                <h2 style={{ color: 'var(--text-main)', fontSize: '2rem', marginBottom: '1rem' }}>This page will be available <span style={{ color: 'var(--accent)' }}>soon</span></h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>We are currently building this dashboard. Please check back later.</p>
            </div>
        </main>
    </div>
);

export default ParcelReceiverDashboard;

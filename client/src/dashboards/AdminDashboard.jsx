import React from 'react';
import Navbar from '../components/Navbar';
import DashboardCard from '../components/DashboardCard';

const AdminDashboard = () => (
    <div className="app-container">
        <Navbar />
        <main className="main-content">
            <header className="dashboard-header">
                <div>
                    <h1>Admin <span>Control</span></h1>
                    <p className="subtitle">Real-time overall tracking and delay prediction engine.</p>
                </div>
                <button className="primary-btn pulse-glow">System Settings</button>
            </header>

            <section className="dashboard-grid">
                <DashboardCard title="Total Parcels Today" value="12,430" trend="+14% this week" icon="📦" trendPositive={true} />
                <DashboardCard title="Active Drivers" value="342" trend="98% on time" icon="🚚" trendPositive={true} />
                <DashboardCard title="Predicted Delays" value="89" trend="-5% from yesterday" icon="⚠️" trendPositive={false} />
                <DashboardCard title="Avg. Delivery Time" value="45m" trend="-2m improvement" icon="⏱️" trendPositive={true} />
            </section>

            <section className="recent-activity">
                <div className="activity-panel">
                    <h2>System Notifications</h2>
                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="activity-icon info">🔄</div>
                            <div className="activity-details">
                                <h4>Admin Action</h4>
                                <p>System update scheduled for midnight.</p>
                            </div>
                            <span className="activity-time">Just now</span>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </div>
);

export default AdminDashboard;

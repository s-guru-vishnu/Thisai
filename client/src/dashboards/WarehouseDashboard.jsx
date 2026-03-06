import React from 'react';
import Navbar from '../components/Navbar';
import DashboardCard from '../components/DashboardCard';

const WarehouseDashboard = () => (
    <div className="app-container">
        <Navbar />
        <main className="main-content">
            <header className="dashboard-header">
                <div>
                    <h1>Warehouse <span>Operations</span></h1>
                    <p className="subtitle">Hub management, inter-warehouse transfers, sorting and dispatch.</p>
                </div>
                <button className="primary-btn pulse-glow">Scan Incoming Batch</button>
            </header>

            <section className="dashboard-grid">
                <DashboardCard title="Inbound from Receivers" value="8,400" trend="+12% today" icon="📥" trendPositive={true} />
                <DashboardCard title="Inter-Warehouse Transit" value="3,210" trend="1,200 incoming / 2,010 out" icon="🔄" trendPositive={true} />
                <DashboardCard title="Ready for Last-Mile" value="5,120" trend="-150 from yesterday" icon="🚚" trendPositive={true} />
                <DashboardCard title="Total Inventory" value="45,120" trend="92% capacity" icon="🏭" trendPositive={true} />
            </section>

            <section className="recent-activity">
                <div className="activity-panel">
                    <h2>Recent Warehouse Activities</h2>
                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="activity-icon info">📥</div>
                            <div className="activity-details">
                                <h4>Batch Received (First-Mile)</h4>
                                <p>Received 320 parcels from South District Receiver Portal.</p>
                            </div>
                            <span className="activity-time">10 mins ago</span>
                        </div>
                        <div className="activity-item">
                            <div className="activity-icon success">🔄</div>
                            <div className="activity-details">
                                <h4>Inter-Warehouse Dispatch</h4>
                                <p>Dispatched 1,200 parcels to North Region Warehouse via Truck TN-04-XX-9999.</p>
                            </div>
                            <span className="activity-time">45 mins ago</span>
                        </div>
                        <div className="activity-item">
                            <div className="activity-icon info">🔄</div>
                            <div className="activity-details">
                                <h4>Inter-Warehouse Arrival</h4>
                                <p>Received 800 parcels from West Region Warehouse for regional distribution.</p>
                            </div>
                            <span className="activity-time">2 hrs ago</span>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </div>
);

export default WarehouseDashboard;

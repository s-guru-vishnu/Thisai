import React from 'react';
import Navbar from '../components/Navbar';
import MetricCard from '../components/MetricCard';
import { Package, Truck, AlertTriangle, Clock, Bell, RefreshCw, Smartphone, CloudRain } from 'lucide-react';

const AdminDashboard = () => {
    const notifications = [
        { id: 1, title: 'Driver Delayed', description: 'Driver ID #342 delayed due to heavy traffic on Route 4.', time: '5 mins ago', type: 'warning', icon: <Truck size={18} /> },
        { id: 2, title: 'Weather Alert', description: 'Rain affecting delivery routes in the North zone.', time: '20 mins ago', type: 'info', icon: <CloudRain size={18} /> },
        { id: 3, title: 'New Parcel Registered', description: '50 new parcels registered from "Tech Masters" seller.', time: '45 mins ago', type: 'success', icon: <Package size={18} /> },
        { id: 4, title: 'System Update', description: 'System update scheduled for midnight (GMT+5:30).', time: '1 hr ago', type: 'info', icon: <RefreshCw size={18} /> },
        { id: 5, title: 'Unusual Workload', description: 'Hub #12 reported workload imbalance (AI Prediction).', time: '2 hrs ago', type: 'warning', icon: <AlertTriangle size={18} /> }
    ];

    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">
                <header className="dashboard-header">
                    <div>
                        <h1>Admin <span>Control</span></h1>
                        <p className="subtitle">Real-time overall tracking and delay prediction engine.</p>
                    </div>
                    <button className="primary-btn pulse-glow" onClick={() => window.location.href = '/dashboard/settings'}>
                        System Settings
                    </button>
                </header>

                <section className="dashboard-grid">
                    <MetricCard title="Total Parcels Today" value="12,430" trend="+14% this week" icon={Package} trendPositive={true} />
                    <MetricCard title="Active Drivers" value="342" trend="98% on time" icon={Truck} trendPositive={true} />
                    <MetricCard title="Predicted Delays" value="89" trend="-5% from yesterday" icon={AlertTriangle} trendPositive={false} />
                    <MetricCard title="Avg. Delivery Time" value="45m" trend="-2m improvement" icon={Clock} trendPositive={true} />
                </section>

                <section className="dashboard-sections-container" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                    <div className="activity-panel">
                        <h2>System Notifications</h2>
                        <div className="activity-list">
                            {notifications.map((notif) => (
                                <div key={notif.id} className="activity-item">
                                    <div className={`activity-icon ${notif.type}`}>
                                        {notif.icon}
                                    </div>
                                    <div className="activity-details">
                                        <h4>{notif.title}</h4>
                                        <p>{notif.description}</p>
                                    </div>
                                    <span className="activity-time">{notif.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="quick-stats-panel" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '2rem' }}>
                        <h2>Quick Insights</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
                            <div className="stat-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>AI Confidence Score</span>
                                <span style={{ color: 'var(--success)', fontWeight: '700' }}>94.2%</span>
                            </div>
                            <div className="stat-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Online Support</span>
                                <span style={{ color: 'var(--info)', fontWeight: '700' }}>Active</span>
                            </div>
                            <div className="stat-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Server Health</span>
                                <span style={{ color: 'var(--success)', fontWeight: '700' }}>Optimal</span>
                            </div>
                        </div>
                        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,107,0,0.05)', borderRadius: '12px', border: '1px dashed var(--accent)' }}>
                            <h4 style={{ color: 'var(--accent)', margin: '0 0 0.5rem 0' }}>AI TIP</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                Optimizing routes in the North zone could reduce overall delay probability by 8% today.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <style>{`
                @media (max-width: 1000px) {
                    .dashboard-sections-container {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;

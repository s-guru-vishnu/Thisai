import React from 'react';
import Navbar from '../components/Navbar';
import MetricCard from '../components/MetricCard';
import axios from 'axios';
import { Package, Truck, AlertTriangle, Clock, Bell, RefreshCw, Smartphone, CloudRain, Info, CheckCircle } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = React.useState({
        totalParcelsToday: 0,
        activeDrivers: 0,
        predictedDelays: 0,
        avgDeliveryTime: '...',
        aiConfidence: '...',
        onlineSupport: '...',
        serverHealth: '...',
        parcelTrend: '...',
        driverTrend: '...',
        delayTrend: '...',
        avgDeliveryTrend: '...',
        aiTip: 'Initializing AI engine...'
    });
    const [notifications, setNotifications] = React.useState([]);

    React.useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
                
                const [statsRes, notificationsRes] = await Promise.all([
                    axios.get(`${apiBase}/api/admin/dashboard/stats`, config),
                    axios.get(`${apiBase}/api/admin/notifications`, config)
                ]);
                
                setStats(statsRes.data);
                setNotifications(notificationsRes.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            }
        };
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">
                <header className="dashboard-header">
                    <div>
                        <h1>Admin <span>Control</span></h1>
                        <p className="subtitle">Real-time overall tracking and delay prediction engine.</p>
                    </div>
                </header>

                <section className="dashboard-grid">
                    <MetricCard title="Total Parcels Today" value={stats.totalParcelsToday.toLocaleString()} trend={stats.parcelTrend} icon={Package} trendPositive={true} />
                    <MetricCard title="Active Drivers" value={stats.activeDrivers.toLocaleString()} trend={stats.driverTrend} icon={Truck} trendPositive={true} />
                    <MetricCard title="Predicted Delays" value={stats.predictedDelays.toLocaleString()} trend={stats.delayTrend} icon={AlertTriangle} trendPositive={false} />
                    <MetricCard title="Avg. Delivery Time" value={stats.avgDeliveryTime} trend={stats.avgDeliveryTrend} icon={Clock} trendPositive={true} />
                </section>

                <section className="dashboard-sections-container" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                    <div className="activity-panel">
                        <h2>System Notifications</h2>
                        <div className="activity-list">
                            {notifications.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No recent system notifications.</div>
                            ) : (
                                notifications.map((notif) => (
                                    <div key={notif.id} className="activity-item">
                                        <div className={`activity-icon ${notif.type}`}>
                                            {notif.type === 'warning' ? <AlertTriangle size={20} /> : notif.type === 'success' ? <CheckCircle size={20} /> : <Info size={20} />}
                                        </div>
                                        <div className="activity-details">
                                            <h4>{notif.title}</h4>
                                            <p>{notif.message}</p>
                                        </div>
                                        <span className="activity-time">{notif.time}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="quick-stats-panel" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '2rem' }}>
                        <h2>Quick Insights</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
                            <div className="stat-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>AI Confidence Score</span>
                                <span style={{ color: 'var(--success)', fontWeight: '700' }}>{stats.aiConfidence}</span>
                            </div>
                            <div className="stat-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Online Support</span>
                                <span style={{ color: 'var(--info)', fontWeight: '700' }}>{stats.onlineSupport}</span>
                            </div>
                            <div className="stat-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Server Health</span>
                                <span style={{ color: 'var(--success)', fontWeight: '700' }}>{stats.serverHealth}</span>
                            </div>
                        </div>
                        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,107,0,0.05)', borderRadius: '12px', border: '1px dashed var(--accent)' }}>
                            <h4 style={{ color: 'var(--accent)', margin: '0 0 0.5rem 0' }}>AI TIP</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                {stats.aiTip}
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

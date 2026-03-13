import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DashboardCard from '../components/DashboardCard';
import { Box, X, CheckSquare, Package, Truck, Search, QrCode, MapPin } from 'lucide-react';

const ManagerDashboard = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isManager = userInfo.role === 'manager';
    const userHub = userInfo.hub || 'Coimbatore';
    const userRegion = userInfo.region || 'Western Tamil Nadu';

    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [selectedHub, setSelectedHub] = useState(isManager ? userHub : 'coimbatore');

    useEffect(() => {
        const fetchParcels = async () => {
            try {
                const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
                const res = await axios.get(`${apiBase}/api/parcels`);
                setProducts(res.data);
            } catch (err) {
                console.error("Failed to fetch parcels", err);
                const localData = JSON.parse(localStorage.getItem('sellerDeliveries') || '[]');
                setProducts(localData);
            }
        };
        fetchParcels();
    }, []);

    // Flow stats based on hub selection (mixing real and mock for demonstration)
    const intraRegion = products.length; // Local parcels
    const incomingInterHub = Math.floor(products.length * 0.4) || 24;
    const outgoingInterHub = Math.floor(products.length * 0.3) || 15;
    const bottlenecks = products.filter(p => p.status && (p.status.toLowerCase().includes('issue') || p.status.toLowerCase().includes('return'))).length;

    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">
                <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1>{isManager ? `${userRegion} Manager` : 'Regional Hub Manager'}</h1>
                        <p className="subtitle">Hub-to-hub flows, tracking, and truck utilization for <strong>{selectedHub}</strong>.</p>
                    </div>
                    <div className="hub-selector" style={{ background: 'var(--panel-bg)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>📍 Assigned Hub/Region:</label>
                        {isManager ? (
                            <div style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 'bold' }}>
                                {userHub} ({userRegion})
                            </div>
                        ) : (
                            <select
                                value={selectedHub}
                                onChange={(e) => setSelectedHub(e.target.value)}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-accent)',
                                    background: 'var(--bg-color)',
                                    color: 'var(--text-main)',
                                    fontSize: '0.95rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    outline: 'none'
                                }}
                            >
                                <option value="coimbatore">Western TN (Coimbatore)</option>
                                <option value="chennai">Northern TN (Chennai)</option>
                                <option value="trichy">Central TN (Trichy)</option>
                                <option value="madurai">Southern TN (Madurai)</option>
                                <option value="tirunelveli">Coastal South (Tirunelveli)</option>
                            </select>
                        )}
                    </div>
                </header>

                <section className="dashboard-grid">
                    <DashboardCard title="Intra-Region Deliveries" value={intraRegion.toLocaleString()} trend="To local district loops" icon="📦" trendPositive={true} />
                    <DashboardCard title="Incoming Transfers" value={incomingInterHub.toLocaleString()} trend="From Border Hubs" icon="📥" trendPositive={true} />
                    <DashboardCard title="Outgoing Transfers" value={outgoingInterHub.toLocaleString()} trend="Dispatched to Borders" icon="📤" trendPositive={true} />
                    <DashboardCard title="Delayed / Bottlenecks" value={bottlenecks.toLocaleString()} trend="Requires attention" icon="⚠️" trendPositive={false} />
                </section>

                <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <div 
                        onClick={() => window.location.href = '/settings/addresses'}
                        style={{ 
                            background: 'rgba(255,255,255,0.03)', 
                            padding: '1.5rem', 
                            borderRadius: '15px', 
                            border: '1px solid var(--border-color)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            transition: 'all 0.3s'
                        }}
                        className="quick-action-card"
                    >
                        <div style={{ background: 'rgba(255,107,0,0.1)', color: 'var(--accent)', padding: '12px', borderRadius: '12px' }}>
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Hub Addresses</h4>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage regional hub and collection addresses.</p>
                        </div>
                    </div>
                </div>

                <section className="product-table-section" style={{ marginTop: '2rem' }}>
                    <div className="panel" style={{ background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <h2 style={{ margin: 0 }}>Hub Inventory Details ({selectedHub.toUpperCase()})</h2>
                            <input
                                type="text"
                                placeholder="Search Tracking Code or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', minWidth: '250px' }}
                            />
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>ID / Tracking</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Product Info</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Route Details</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Hub Status</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.filter(p =>
                                        p.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        p.parcelId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        p.trackingCode?.toLowerCase().includes(searchTerm.toLowerCase())
                                    ).map(product => (
                                        <tr key={product._id || product.id || product.parcelId} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                                            <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                                                <div style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>{product.trackingCode || 'No Code'}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {product.parcelId || product.id}</div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: '500', color: 'var(--text-color)' }}>{product.productName}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{product.category} • {product.weight}</div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: '500', color: 'var(--text-color)' }}>From: {product.origin || 'Not Configured'}</div>
                                                <div style={{ fontWeight: '500', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Dest: {product.destination}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>To: {product.customerName}</div>
                                                <div style={{ fontSize: '0.82rem', color: 'var(--accent)', marginTop: '0.3rem', fontWeight: '600' }}>
                                                    {product.status === 'Received' ? 'Intra-Region Delivery' : 'Inter-Hub Required'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.3rem 0.6rem',
                                                    borderRadius: '20px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 'bold',
                                                    background: product.status === 'Received' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 152, 0, 0.15)',
                                                    color: product.status === 'Received' ? '#4CAF50' : '#FF9800'
                                                }}>
                                                    {product.status || 'At Hub'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <button style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--accent-light, #007bff)', background: 'transparent', color: 'var(--accent-light, #007bff)', cursor: 'pointer', fontWeight: 'bold' }}>View Flow</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {products.filter(p => !p.productName && !p.parcelId) /* Fallback filtering */}
                                    {products.filter(p => p.productName?.toLowerCase().includes(searchTerm.toLowerCase()) || (p.parcelId && p.parcelId.toLowerCase().includes(searchTerm.toLowerCase())) || (p.trackingCode && p.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()))).length === 0 && (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No products found matching your search.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <section className="recent-activity" style={{ marginTop: '2rem' }}>
                    <div className="activity-panel">
                        <h2>Hub Logistics Activity</h2>
                        <div className="activity-list">
                            <div className="activity-item">
                                <div className="activity-icon info">📥</div>
                                <div className="activity-details">
                                    <h4>Incoming Inter-Hub Hand-off</h4>
                                    <p>Truck arrived via border hub transfer (e.g. from Salem/Namakkal). 450 parcels entered {selectedHub} hub.</p>
                                </div>
                                <span className="activity-time">5 mins ago</span>
                            </div>
                            <div className="activity-item">
                                <div className="activity-icon success">📤</div>
                                <div className="activity-details">
                                    <h4>Outgoing Inter-Hub Dispatch</h4>
                                    <p>Truck dispatched to Border Hub for inter-region transfer. Next stop depends on target destination.</p>
                                </div>
                                <span className="activity-time">25 mins ago</span>
                            </div>
                            <div className="activity-item">
                                <div className="activity-icon warning">🚚</div>
                                <div className="activity-details">
                                    <h4>Intra-Region Loop Departed</h4>
                                    <p>Truck 05 loaded with 320 parcels bound for local district loops within the {selectedHub} region.</p>
                                </div>
                                <span className="activity-time">1 hr ago</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ManagerDashboard;

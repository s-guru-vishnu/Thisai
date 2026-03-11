import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DashboardCard from '../components/DashboardCard';
import { Box, X, CheckSquare, Package, Truck, Search, QrCode } from 'lucide-react';

const ManagerDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);

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

    const totalReceived = products.length;
    const pendingDispatch = products.filter(p => !p.status || p.status === 'Received' || p.status === 'Pending Dispatch').length;
    const inTransit = products.filter(p => p.status === 'Dispatched to Hub' || p.status === 'In Transit').length;
    const issues = products.filter(p => p.status && (p.status.toLowerCase().includes('issue') || p.status.toLowerCase().includes('return'))).length;

    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">
                <header className="dashboard-header">
                    <div>
                        <h1>Manager <span>Portal</span></h1>
                        <p className="subtitle">Operational statistics and team overview.</p>
                    </div>
                </header>

                <section className="dashboard-grid">
                    <DashboardCard title="Received from Sellers" value={totalReceived.toLocaleString()} trend="+15% today" icon="🏪" trendPositive={true} />
                    <DashboardCard title="Pending Hub Dispatch" value={pendingDispatch.toLocaleString()} trend="Next truck in 30m" icon="⏳" trendPositive={true} />
                    <DashboardCard title="In Transit to Warehouse" value={inTransit.toLocaleString()} trend="-50 from yesterday" icon="🚚" trendPositive={true} />
                    <DashboardCard title="Seller Issues/Returns" value={issues.toLocaleString()} trend="+2 new issues" icon="⚠️" trendPositive={false} />
                </section>

                <section className="product-table-section" style={{ marginTop: '2rem' }}>
                    <div className="panel" style={{ background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <h2 style={{ margin: 0 }}>Product Data & Delivery Details</h2>
                            <input
                                type="text"
                                placeholder="Search Product ID or Name..."
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
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Seller</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Delivery Details</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
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
                                            <td style={{ padding: '1rem', color: 'var(--text-color)' }}>{product.seller}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: '500', color: 'var(--text-color)' }}>To: {product.customerName}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{product.deliveryAddress}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Type: {product.deliveryType} • Dest: {product.destination}</div>
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
                                                    {product.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <button style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--accent-light, #007bff)', background: 'transparent', color: 'var(--accent-light, #007bff)', cursor: 'pointer', fontWeight: 'bold' }}>Action</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {products.filter(p => !p.productName && !p.parcelId) /* Fallback filtering */}
                                    {products.filter(p => p.productName?.toLowerCase().includes(searchTerm.toLowerCase()) || (p.parcelId && p.parcelId.toLowerCase().includes(searchTerm.toLowerCase())) || (p.trackingCode && p.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()))).length === 0 && (
                                        <tr>
                                            <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No products found matching your search.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <section className="recent-activity" style={{ marginTop: '2rem' }}>
                    <div className="activity-panel">
                        <h2>Recent Collections & Dispatches</h2>
                        <div className="activity-list">
                            <div className="activity-item">
                                <div className="activity-icon info">🏪</div>
                                <div className="activity-details">
                                    <h4>Seller Drop-off</h4>
                                    <p>Received 50 parcels from Seller "Tech Gadgets Store".</p>
                                </div>
                                <span className="activity-time">5 mins ago</span>
                            </div>
                            <div className="activity-item">
                                <div className="activity-icon success">🚚</div>
                                <div className="activity-details">
                                    <h4>Dispatched to Warehouse</h4>
                                    <p>Batch #HUB-991 dispatched to Main City Warehouse.</p>
                                </div>
                                <span className="activity-time">25 mins ago</span>
                            </div>
                            <div className="activity-item">
                                <div className="activity-icon warning">🚨</div>
                                <div className="activity-details">
                                    <h4>Packaging Issue</h4>
                                    <p>Flagged poor packaging from Seller "Fashion Hub", pending review.</p>
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

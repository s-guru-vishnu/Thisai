import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import Navbar from '../components/Navbar';
import { Package, Truck, MapPin, CheckCircle, ArrowLeft, MoreVertical, Edit2, QrCode, X } from 'lucide-react';
import '../styles/dashboard.css';
import '../styles/seller.css';

const SellerDeliveries = () => {
    const [deliveries, setDeliveries] = useState(() => {
        const saved = localStorage.getItem('sellerDeliveries');
        return saved ? JSON.parse(saved) : [];
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [statusVal, setStatusVal] = useState('');
    const [selectedQR, setSelectedQR] = useState(null);

    useEffect(() => {
        localStorage.setItem('sellerDeliveries', JSON.stringify(deliveries));
    }, [deliveries]);

    const handleEditStatus = (delivery) => {
        setEditingId(delivery.id);
        setStatusVal(delivery.status || 'Pending Pickup');
    };

    const saveStatus = (id) => {
        const updatedDeliveries = deliveries.map(del => {
            if (del.id === id) {
                return { ...del, status: statusVal };
            }
            return del;
        });
        setDeliveries(updatedDeliveries);
        setEditingId(null);
    };

    const stats = {
        total: deliveries.length,
        pending: deliveries.filter(d => d.status === 'Pending Pickup' || !d.status).length,
        transit: deliveries.filter(d => d.status === 'In Transit').length,
        delivered: deliveries.filter(d => d.status === 'Delivered').length,
    };

    const filteredDeliveries = deliveries.filter(del =>
        (del.productName && del.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (del.id && del.id.toString().includes(searchTerm)) ||
        (del.customerName && del.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (del.trackingCode && del.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="app-container">
            <Navbar />

            <main className="main-content" style={{ paddingTop: '2rem' }}>
                <header className="dashboard-header" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <Link to="/seller" className="secondary-btn" style={{ padding: '0.6rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1>Deliveries <span>Tracker</span></h1>
                            <p className="subtitle">Track and update the status of all your dispatched packages</p>
                        </div>
                    </div>
                </header>

                <div className="stats-row">
                    <div className="stat-widget" style={{ padding: '1rem 1.5rem' }}>
                        <div className="stat-info">
                            <h4>Total Dispatched</h4>
                            <p className="value">{stats.total}</p>
                        </div>
                    </div>
                    <div className="stat-widget" style={{ padding: '1rem 1.5rem', borderColor: 'rgba(255,165,0,0.3)' }}>
                        <div className="stat-info">
                            <h4 style={{ color: 'orange' }}>Pending Pickup</h4>
                            <p className="value">{stats.pending}</p>
                        </div>
                    </div>
                    <div className="stat-widget" style={{ padding: '1rem 1.5rem', borderColor: 'rgba(0,153,255,0.3)' }}>
                        <div className="stat-info">
                            <h4 style={{ color: '#0099ff' }}>In Transit</h4>
                            <p className="value">{stats.transit}</p>
                        </div>
                    </div>
                    <div className="stat-widget" style={{ padding: '1rem 1.5rem', borderColor: 'rgba(0,204,102,0.3)' }}>
                        <div className="stat-info">
                            <h4>Delivered</h4>
                            <p className="value">{stats.delivered}</p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-card" style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h3 style={{ margin: 0 }}>All Deliveries</h3>
                        <input
                            type="text"
                            placeholder="Search by ID, Tracking Code, Customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '0.8rem 1.2rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.4)', color: 'white', minWidth: '300px', outline: 'none' }}
                        />
                    </div>

                    <div className="orders-table-container">
                        <table className="orders-table" style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Tracking Code</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Product</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Destination</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Status</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>QR/Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDeliveries.slice(0).reverse().map(del => (
                                    <tr key={del.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.3s' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 'bold', color: 'var(--accent)', fontSize: '1.1rem', letterSpacing: '1px' }}>
                                                {del.trackingCode || 'N/A'}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{del.id.toString().slice(-6)}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: '600', color: '#fff' }}>{del.productName}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{del.category || 'N/A'} • {del.weight || 'N/A'}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: '500', color: '#fff' }}>From: {del.origin || 'Not Configured'}</div>
                                            <div style={{ fontWeight: '500', color: 'var(--text-muted)', marginTop: '0.2rem' }}>To: {del.customerName || 'TBD'}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{del.deliveryAddress || 'No Address'}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {editingId === del.id ? (
                                                <select
                                                    value={statusVal}
                                                    onChange={(e) => setStatusVal(e.target.value)}
                                                    style={{ padding: '0.5rem', borderRadius: '6px', background: 'rgba(0,0,0,0.6)', color: 'white', border: '1px solid var(--accent)', outline: 'none' }}
                                                >
                                                    <option value="Pending Pickup">Pending Pickup</option>
                                                    <option value="In Transit">In Transit</option>
                                                    <option value="Delivered">Delivered</option>
                                                </select>
                                            ) : (
                                                <span className="status-badge" style={{
                                                    background: del.status === 'Delivered' ? 'rgba(0,204,102,0.1)' : del.status === 'In Transit' ? 'rgba(0,153,255,0.1)' : 'rgba(255,165,0,0.1)',
                                                    color: del.status === 'Delivered' ? 'var(--success)' : del.status === 'In Transit' ? '#0099ff' : 'orange',
                                                    padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px'
                                                }}>
                                                    {del.status !== 'Delivered' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: del.status === 'In Transit' ? '#0099ff' : 'orange', animation: 'pulse 2s infinite' }}></div>}
                                                    {del.status === 'Delivered' && <CheckCircle size={14} />}
                                                    {del.status || 'Pending Pickup'}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <button
                                                    onClick={() => setSelectedQR(del)}
                                                    className="secondary-btn"
                                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '8px', color: 'white' }}
                                                    title="View QR Code"
                                                >
                                                    <QrCode size={18} />
                                                </button>

                                                {editingId === del.id ? (
                                                    <button onClick={() => saveStatus(del.id)} className="primary-btn" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', borderRadius: '6px' }}>
                                                        Save
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleEditStatus(del)} className="secondary-btn" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', padding: '0.4rem', borderRadius: '6px', color: 'var(--text-muted)', cursor: 'pointer' }} title="Update Status">
                                                        <Edit2 size={16} /> Update
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredDeliveries.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No deliveries found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* QR Code Modal */}
            {selectedQR && (
                <div className="modal-overlay" onClick={() => setSelectedQR(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', maxWidth: '400px' }}>
                        <button className="close-modal-btn" onClick={() => setSelectedQR(null)}><X size={24} /></button>
                        <h2 style={{ marginBottom: '1rem' }}>Delivery QR Code</h2>
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', display: 'inline-block', marginBottom: '1.5rem' }}>
                            <QRCodeCanvas value={selectedQR.trackingCode} size={200} />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Tracking Code</p>
                            <h3 style={{ color: 'var(--accent)', letterSpacing: '2px', margin: 0 }}>{selectedQR.trackingCode}</h3>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Receiver can scan this QR or enter the code manually to track and confirm delivery.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerDeliveries;

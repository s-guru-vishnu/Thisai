import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { Package, Calendar, MapPin, CheckCircle, PackageSearch, Eye, X, Clock, User, FileText } from 'lucide-react';

const CustomerHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    useEffect(() => {
        const fetchHistory = async () => {
            if (!userInfo._id) {
                setLoading(false);
                return;
            }
            try {
                const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                // using user _id assuming standard auth structure
                const { data } = await axios.get(`${apiBase}/api/parcel/history/${userInfo._id}`, config);
                setHistory(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching history:', error);
                setLoading(false);
            }
        };

        fetchHistory();
    }, [userInfo._id, userInfo.token]);

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
    };

    const closeModal = () => {
        setSelectedOrder(null);
    };

    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
                    <div>
                        <h1>Order <span>History</span></h1>
                        <p className="subtitle">View details of your past orders and received parcels.</p>
                    </div>
                </header>

                {loading ? (
                    <div style={{ padding: '5rem', textAlign: 'center' }}>
                        <div className="loader">Loading history...</div>
                    </div>
                ) : history.length === 0 ? (
                    <div className="dashboard-card" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '50%', marginBottom: '1.5rem', border: '1px dashed var(--border-color)' }}>
                            <PackageSearch size={64} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <h2 style={{ marginBottom: '10px' }}>No History Found</h2>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
                            You have not received any completed orders yet.
                        </p>
                    </div>
                ) : (
                    <div className="dashboard-card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                                        <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.9rem' }}>Tracking ID</th>
                                        <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.9rem' }}>Product</th>
                                        <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.9rem' }}>Delivery Address</th>
                                        <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.9rem' }}>Date</th>
                                        <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.9rem', textAlign: 'center' }}>Status</th>
                                        <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.9rem', textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((item, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '1.2rem', fontWeight: '500' }}>{item.trackingId || item.trackingCode}</td>
                                            <td style={{ padding: '1.2rem' }}>{item.productName || 'Package'}</td>
                                            <td style={{ padding: '1.2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <MapPin size={16} style={{ color: 'var(--accent)' }} />
                                                    <span style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{item.deliveryAddress}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.2rem', fontSize: '0.9rem' }}>{item.deliveredDate || new Date().toLocaleDateString()}</td>
                                            <td style={{ padding: '1.2rem', textAlign: 'center' }}>
                                                <div className="status-badge" style={{ display: 'inline-flex', background: 'rgba(0,204,102,0.1)', color: 'var(--success)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', alignItems: 'center', gap: '6px' }}>
                                                    <CheckCircle size={14} /> {item.status}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.2rem', textAlign: 'center' }}>
                                                <button onClick={() => handleViewDetails(item)} className="secondary-btn" style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                    <Eye size={16} /> View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    animation: 'fadeIn 0.2s ease'
                }}>
                    <div className="dashboard-card" style={{ 
                        width: '100%', 
                        maxWidth: '600px', 
                        padding: '2rem', 
                        position: 'relative',
                        animation: 'slideUp 0.3s ease'
                    }}>
                        <button 
                            onClick={closeModal}
                            style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                            <X size={24} />
                        </button>
                        
                        <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                            <h2 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Package style={{ color: 'var(--accent)' }} /> Order Details
                            </h2>
                            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Tracking ID: <span style={{ color: 'white', fontWeight: 'bold' }}>{selectedOrder.trackingId || selectedOrder.trackingCode}</span></p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div>
                                <p style={{ margin: '0 0 5px 0', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <MapPin size={14} /> Delivery Address
                                </p>
                                <p style={{ margin: 0, fontWeight: '500' }}>{selectedOrder.deliveryAddress}</p>
                            </div>
                            <div>
                                <p style={{ margin: '0 0 5px 0', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Calendar size={14} /> Delivered Date
                                </p>
                                <p style={{ margin: 0, fontWeight: '500' }}>{selectedOrder.deliveredDate || new Date().toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p style={{ margin: '0 0 5px 0', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <User size={14} /> Received By
                                </p>
                                <p style={{ margin: 0, fontWeight: '500' }}>{selectedOrder.receiverName || 'N/A'}</p>
                            </div>
                            <div>
                                <p style={{ margin: '0 0 5px 0', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <FileText size={14} /> Proof of Delivery
                                </p>
                                <p style={{ margin: 0, fontWeight: '500', color: 'var(--success)' }}>{selectedOrder.proof || 'Verified Signature'}</p>
                            </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h4 style={{ margin: '0 0 1rem 0' }}>Final Timeline</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {selectedOrder.timeline && selectedOrder.timeline.map((step, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                                        <div style={{ padding: '6px', background: 'rgba(0,204,102,0.1)', color: 'var(--success)', borderRadius: '50%' }}>
                                            <CheckCircle size={16} />
                                        </div>
                                        <div>
                                            <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{step.title}</p>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={12} /> {step.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {(!selectedOrder.timeline || selectedOrder.timeline.length === 0) && (
                                     <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                                        <div style={{ padding: '6px', background: 'rgba(0,204,102,0.1)', color: 'var(--success)', borderRadius: '50%' }}>
                                            <CheckCircle size={16} />
                                        </div>
                                        <div>
                                            <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>Delivered</p>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={12} /> {selectedOrder.deliveredDate || 'Completed'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                            <button onClick={closeModal} className="primary-btn" style={{ padding: '0.8rem 2rem' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerHistory;

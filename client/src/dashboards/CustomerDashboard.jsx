import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import CustomerMap from '../components/CustomerMap';
import { Search, QrCode, Package, Truck, MapPin, CheckCircle, X, ShieldCheck, Navigation, Phone, Clock, AlertTriangle } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import LocationRequiredModal from '../components/modals/LocationRequiredModal';
import DashboardTabs from '../components/DashboardTabs';
import '../styles/dashboard.css';

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [trackingInput, setTrackingInput] = useState('');
    const [error, setError] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const [scanner, setScanner] = useState(null);
    const [deliveryDetails, setDeliveryDetails] = useState(null);
    const [isLoadingShipment, setIsLoadingShipment] = useState(true);
    const [activeShipment, setActiveShipment] = useState(null);

    useEffect(() => {
        const fetchActiveShipment = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                if (!userInfo || !userInfo.token) {
                    setIsLoadingShipment(false);
                    return;
                }
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
                const { data } = await axios.get(`${apiBase}/api/parcel/active`, config);
                setActiveShipment(data);
                setIsLoadingShipment(false);
            } catch (err) {
                console.error(err);
                setIsLoadingShipment(false);
            }
        };
        fetchActiveShipment();
    }, []);

    const checkLocationAndProceed = (action) => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const location = userInfo?.location;

        if (!location || !location.addressLine1 || !location.city) {
            setIsLocationModalOpen(true);
        } else {
            action();
        }
    };

    const handleTrack = () => {
        const code = trackingInput.trim().toUpperCase();
        if (!code || code.length !== 10) {
            setError('Please enter a valid 10-digit tracking code.');
            return;
        }
        setError('');
        navigate(`/customer/track?id=${code}`);
    };

    const confirmReceipt = async () => {
        if (!deliveryDetails) return;
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            // In a real app: await axios.put(`http://localhost:5005/api/parcel/confirm/${deliveryDetails.trackingId}`, {}, config);

            setDeliveryDetails(prev => ({ ...prev, status: 'Delivered' }));
            alert('Delivery confirmed! Thank you.');
        } catch (err) {
            console.error(err);
            alert('Failed to confirm receipt.');
        }
    };

    const toggleScanner = () => {
        if (!showScanner) {
            setShowScanner(true);
            setTimeout(() => {
                const newScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
                newScanner.render(
                    (decodedText) => {
                        const code = decodedText.toUpperCase();
                        setTrackingInput(code);
                        if (code.length >= 8) { // Supporting different code lengths if applicable
                            newScanner.clear();
                            setShowScanner(false);
                            
                            // Mark as delivered immediately
                            const handleAutoConfirm = async () => {
                                try {
                                    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                                    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
                                    await axios.put(`${apiBase}/api/parcels/scan/${code}`, {}, {
                                        headers: { Authorization: `Bearer ${userInfo.token}` }
                                    });
                                    alert(`Package ${code} marked as Delivered!`);
                                    window.location.reload(); // Refresh to show updated status
                                } catch (err) {
                                    console.error("Scan verification failed", err);
                                    setError(err.response?.data?.message || 'Verification failed.');
                                }
                            };
                            handleAutoConfirm();
                        } else {
                            setError('Invalid QR Code format.');
                        }
                    },
                    (error) => {
                        // console.warn(error);
                    }
                );
                setScanner(newScanner);
            }, 100);
        } else {
            if (scanner) scanner.clear();
            setShowScanner(false);
        }
    };

    // Rendering block

    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
                    <div>
                        <h1>Track your <span>Shipment</span></h1>
                        <p className="subtitle">Enter your 10-digit code or scan the QR code to track your package</p>
                    </div>
                </header>

                <DashboardTabs />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Section 1: Top Search & Tracking */}
                    <div className="dashboard-card" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', gap: '20px' }}>
                            <div>
                                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', fontWeight: '800' }}>Package Quick Search</h3>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Enter your 10-digit code to track instantly</p>
                            </div>
                            <button
                                onClick={toggleScanner}
                                className="secondary-btn"
                                style={{
                                    padding: '0.7rem 1.4rem',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    background: showScanner ? 'var(--accent)' : 'rgba(255,255,255,0.03)',
                                    color: showScanner ? 'white' : 'var(--accent)',
                                    border: '1px solid rgba(255,107,0,0.2)',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <QrCode size={20} />
                                {showScanner ? 'Close Scanner' : 'Open Scanner'}
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)', opacity: 0.7 }} size={20} />
                                <input
                                    type="text"
                                    placeholder="Enter 10-character Tracking Code"
                                    value={trackingInput}
                                    onChange={(e) => setTrackingInput(e.target.value.toUpperCase())}
                                    style={{ 
                                        width: '100%', 
                                        padding: '1.1rem 1.1rem 1.1rem 3.4rem', 
                                        borderRadius: '12px', 
                                        border: 'none', 
                                        background: 'transparent', 
                                        color: 'white', 
                                        fontSize: '1rem', 
                                        outline: 'none',
                                        letterSpacing: '1px'
                                    }}
                                    maxLength={10}
                                />
                            </div>
                            <button
                                onClick={() => checkLocationAndProceed(handleTrack)}
                                className="primary-btn"
                                style={{ 
                                    padding: '0 2.4rem', 
                                    borderRadius: '12px',
                                    height: '54px',
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    boxShadow: '0 4px 15px rgba(255,107,0,0.2)'
                                }}
                            >
                                Track Now
                            </button>
                        </div>

                        {showScanner && (
                            <div style={{
                                marginTop: '20px',
                                padding: '10px',
                                background: 'rgba(255,107,0,0.02)',
                                borderRadius: '20px',
                                border: '1px solid var(--border-color)',
                                maxWidth: '500px',
                                margin: '20px auto 0 auto'
                            }}>
                                <div id="reader" style={{ width: '100%', overflow: 'hidden', borderRadius: '15px' }}></div>
                            </div>
                        )}

                        {error && <p style={{ color: '#ff4444', marginTop: '15px', textAlign: 'center' }}>{error}</p>}
                    </div>

                    {/* Active Shipment Section (If exists) */}
                    {activeShipment && (
                        <div className="active-shipment-card" style={{ marginBottom: '0' }}>
                            <div className="shipment-info">
                                <div className="shipment-icon-container">
                                    <Truck size={24} />
                                </div>
                                <div className="shipment-details">
                                    <h3>{activeShipment.productName}</h3>
                                    <p>Tracker: <span style={{ color: 'white' }}>{activeShipment.trackingId}</span></p>
                                    <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                                        <div className="shipment-status-badge">
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }}></div>
                                            {activeShipment.status}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 'bold' }}>
                                            <Clock size={16} />
                                            ETA: {activeShipment.eta}
                                        </div>
                                        {activeShipment.delayMinutes > 0 && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#ff4444', fontWeight: 'bold' }}>
                                                <AlertTriangle size={16} />
                                                Delay: {activeShipment.delayMinutes}m
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Horizontal Mini Timeline */}
                            <div style={{ padding: '0 10px', margin: '20px 0', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '7px', left: '20px', right: '20px', height: '2px', background: 'rgba(255,107,0,0.1)', zIndex: 0 }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                                    {activeShipment.timeline && activeShipment.timeline.map((step, idx) => {
                                        // Show only first, intermediate (if any), and last steps for mini view
                                        const isMainStep = idx === 0 || idx === activeShipment.timeline.length - 1 || 
                                                           (activeShipment.timeline.length > 3 && idx === Math.floor(activeShipment.timeline.length / 2));
                                        
                                        if (!isMainStep) return null;

                                        return (
                                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ 
                                                    width: '16px', 
                                                    height: '16px', 
                                                    borderRadius: '50%', 
                                                    background: step.completed ? 'var(--accent)' : 'var(--bg-panel)',
                                                    border: `2px solid ${step.completed ? 'var(--accent)' : 'var(--border-color)'}`,
                                                    boxShadow: step.completed ? '0 0 10px rgba(255,107,0,0.5)' : 'none'
                                                }}></div>
                                                <span style={{ fontSize: '0.65rem', color: step.completed ? 'white' : 'var(--text-muted)', fontWeight: 'bold' }}>{step.title.split(' ').pop()}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="active-shipment-actions">
                                <button
                                    onClick={() => navigate(`/customer/track?id=${activeShipment.trackingId}`)}
                                    className="primary-btn"
                                    style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', height: 'auto' }}
                                >
                                    View Live Map
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Bottom Row: 3 Quick Actions */}
                    <div className="bottom-grid-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        
                        {/* Action 1: Address Book */}
                        <div className="dashboard-card action-card" onClick={() => navigate('/settings/addresses')} style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '15px', transition: 'all 0.3s' }}>
                            <div style={{ background: 'rgba(255,107,0,0.1)', color: 'var(--accent)', padding: '12px', borderRadius: '12px', width: 'fit-content' }}>
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Addresses</h4>
                                <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage your delivery locations.</p>
                            </div>
                        </div>

                        {/* Action 2: Order History */}
                        <div className="dashboard-card action-card" onClick={() => navigate('/customer/history')} style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '15px', transition: 'all 0.3s' }}>
                            <div style={{ background: 'rgba(0,204,102,0.1)', color: 'var(--success)', padding: '12px', borderRadius: '12px', width: 'fit-content' }}>
                                <Package size={24} />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>History</h4>
                                <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>View past shipments and receipts.</p>
                            </div>
                        </div>

                        {/* Action 3: Profile Settings */}
                        <div className="dashboard-card action-card" onClick={() => navigate('/settings')} style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '15px', transition: 'all 0.3s' }}>
                            <div style={{ background: 'rgba(0,122,255,0.1)', color: '#007aff', padding: '12px', borderRadius: '12px', width: 'fit-content' }}>
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Account</h4>
                                <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Security and profile management.</p>
                            </div>
                        </div>

                    </div>

                </div>
            </main>

            <LocationRequiredModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
            />

            <style>{`
                .action-card {
                    backdrop-filter: blur(8px);
                    background: rgba(255, 255, 255, 0.03) !important;
                    border: 1px solid rgba(255, 255, 255, 0.05) !important;
                    position: relative;
                    overflow: hidden;
                }
                .action-card::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, transparent 0%, rgba(255,107,0,0.05) 100%);
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                .action-card:hover {
                    transform: translateY(-8px) scale(1.02);
                    border-color: rgba(255,107,0,0.3) !important;
                    box-shadow: 0 15px 30px rgba(0,0,0,0.4), 0 0 20px rgba(255,107,0,0.1);
                }
                .action-card:hover::after {
                    opacity: 1;
                }
                .action-card:hover div:first-child {
                    transform: scale(1.1) rotate(-5deg);
                    box-shadow: 0 0 20px rgba(255,107,0,0.2);
                }
                .action-card div:first-child {
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                @media (max-width: 1000px) {
                    .bottom-grid-row {
                        grid-template-columns: 1fr 1fr !important;
                        gap: 1.2rem !important;
                    }
                }
                @media (max-width: 600px) {
                    .bottom-grid-row {
                        grid-template-columns: 1fr !important;
                        gap: 1rem !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default CustomerDashboard;

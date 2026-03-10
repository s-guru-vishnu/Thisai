import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Search, QrCode, Package, Truck, MapPin, CheckCircle, X, ShieldCheck } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import '../styles/dashboard.css';

const CustomerDashboard = () => {
    const [trackingInput, setTrackingInput] = useState('');
    const [deliveryDetails, setDeliveryDetails] = useState(null);
    const [error, setError] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const [scanner, setScanner] = useState(null);

    const handleTrack = () => {
        if (!trackingInput.trim()) {
            setError('Please enter a tracking code.');
            return;
        }

        const savedDeliveries = JSON.parse(localStorage.getItem('sellerDeliveries') || '[]');
        const match = savedDeliveries.find(d => d.trackingCode === trackingInput.trim().toUpperCase());

        if (match) {
            setDeliveryDetails(match);
            setError('');
            setShowScanner(false);
        } else {
            setDeliveryDetails(null);
            setError('Invalid tracking code. Please check and try again.');
        }
    };

    const toggleScanner = () => {
        if (!showScanner) {
            setShowScanner(true);
            setTimeout(() => {
                const newScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
                newScanner.render((decodedText) => {
                    const code = decodedText.toUpperCase();
                    setTrackingInput(code);
                    newScanner.clear();
                    setShowScanner(false);

                    // Trigger tracking and automatic confirmation
                    const savedDeliveries = JSON.parse(localStorage.getItem('sellerDeliveries') || '[]');
                    const matchIndex = savedDeliveries.findIndex(d => d.trackingCode === code);

                    if (matchIndex !== -1) {
                        const matchedDelivery = savedDeliveries[matchIndex];

                        // If already delivered, just show it
                        if (matchedDelivery.status === 'Delivered') {
                            setDeliveryDetails(matchedDelivery);
                        } else {
                            // Automatically mark as delivered
                            const updatedDeliveries = [...savedDeliveries];
                            updatedDeliveries[matchIndex] = { ...matchedDelivery, status: 'Delivered' };
                            localStorage.setItem('sellerDeliveries', JSON.stringify(updatedDeliveries));

                            setDeliveryDetails(updatedDeliveries[matchIndex]);
                            setError('');
                        }
                    } else {
                        setError('Scanned code is invalid.');
                    }
                }, (error) => {
                    // console.warn(error);
                });
                setScanner(newScanner);
            }, 100);
        } else {
            if (scanner) scanner.clear();
            setShowScanner(false);
        }
    };

    const confirmReceipt = () => {
        const savedDeliveries = JSON.parse(localStorage.getItem('sellerDeliveries') || '[]');
        const updatedDeliveries = savedDeliveries.map(d => {
            if (d.id === deliveryDetails.id) {
                return { ...d, status: 'Delivered' };
            }
            return d;
        });
        localStorage.setItem('sellerDeliveries', JSON.stringify(updatedDeliveries));
        setDeliveryDetails({ ...deliveryDetails, status: 'Delivered' });
    };

    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <header className="dashboard-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1>Track your <span>Shipment</span></h1>
                    <p className="subtitle">Enter your 10-digit code or scan the QR code to track your package</p>
                </header>

                <div className="dashboard-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                            <input
                                type="text"
                                placeholder="Enter 10-character Tracking Code (e.g. AB12345678)"
                                value={trackingInput}
                                onChange={(e) => setTrackingInput(e.target.value.toUpperCase())}
                                style={{ width: '100%', padding: '1.2rem 1.2rem 1.2rem 3rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.3)', color: 'white', fontSize: '1.1rem', outline: 'none' }}
                            />
                        </div>
                        <button onClick={handleTrack} className="primary-btn" style={{ padding: '0 2rem' }}>Track</button>
                        <button
                            onClick={toggleScanner}
                            style={{ padding: '0 1.5rem', borderRadius: '12px', background: showScanner ? 'var(--accent)' : 'rgba(255,255,255,0.1)', border: '1px solid var(--border-color)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Scan QR Code"
                        >
                            <QrCode size={24} />
                        </button>
                    </div>

                    {showScanner && (
                        <div style={{ marginTop: '20px' }}>
                            <div id="reader" style={{ width: '100%', overflow: 'hidden', borderRadius: '12px', border: '2px solid var(--accent)' }}></div>
                            <button onClick={toggleScanner} className="secondary-btn" style={{ width: '100%', marginTop: '10px' }}>Close Scanner</button>
                        </div>
                    )}

                    {error && <p style={{ color: '#ff4444', marginTop: '15px', textAlign: 'center' }}>{error}</p>}
                </div>

                {deliveryDetails && (
                    <div className="dashboard-card" style={{ padding: '2rem', animation: 'fadeIn 0.5s ease' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ margin: '0 0 5px 0' }}>Shipment Details</h3>
                                <p style={{ color: 'var(--accent)', fontWeight: 'bold', margin: 0, letterSpacing: '1px' }}>CODE: {deliveryDetails.trackingCode}</p>
                            </div>
                            <div className="status-badge" style={{
                                background: deliveryDetails.status === 'Delivered' ? 'rgba(0,204,102,0.1)' : 'rgba(255,165,0,0.1)',
                                color: deliveryDetails.status === 'Delivered' ? 'var(--success)' : 'orange',
                                padding: '8px 15px', borderRadius: '8px', fontWeight: 'bold'
                            }}>
                                {deliveryDetails.status}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem' }}>
                                    <Package style={{ color: 'var(--accent)' }} />
                                    <div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 4px 0' }}>Product Name</p>
                                        <p style={{ fontWeight: '600', margin: 0 }}>{deliveryDetails.productName}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <Truck style={{ color: 'var(--accent)' }} />
                                    <div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 4px 0' }}>Delivery Type</p>
                                        <p style={{ fontWeight: '600', margin: 0 }}>{deliveryDetails.deliveryType || 'Standard'}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem' }}>
                                    <MapPin style={{ color: 'var(--accent)' }} />
                                    <div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 4px 0' }}>Destination</p>
                                        <p style={{ fontWeight: '600', margin: 0 }}>{deliveryDetails.deliveryAddress}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <CheckCircle style={{ color: 'var(--accent)' }} />
                                    <div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 4px 0' }}>Current Hub</p>
                                        <p style={{ fontWeight: '600', margin: 0 }}>{deliveryDetails.destination || 'Origin Hub'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {deliveryDetails.status !== 'Delivered' && (
                            <div style={{ marginTop: '2.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <ShieldCheck size={48} style={{ color: 'var(--success)', marginBottom: '1rem' }} />
                                <h3>Have you received this package?</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Please confirm receipt only if you have the package in hand.</p>
                                <button onClick={confirmReceipt} className="primary-btn" style={{ background: 'var(--success)', padding: '1rem 3rem', fontSize: '1.1rem' }}>Confirm Receipt</button>
                            </div>
                        )}

                        {deliveryDetails.status === 'Delivered' && (
                            <div style={{ marginTop: '2.5rem', textAlign: 'center', color: 'var(--success)', border: '1px solid var(--success)', padding: '1.5rem', borderRadius: '12px', background: 'rgba(0,204,102,0.05)' }}>
                                <CheckCircle size={32} style={{ marginBottom: '10px' }} />
                                <h3 style={{ margin: 0 }}>Delivered & Confirmed</h3>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default CustomerDashboard;

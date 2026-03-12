import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Truck, MapPin, Box, ArrowLeft, Navigation, Search, CheckCircle, Download, X, Mail, User, Info } from 'lucide-react';
import '../styles/dashboard.css';

const containerStyle = {
    width: '100%',
    height: '100%'
};

const center = {
    lat: 13.0827,
    lng: 80.2707
};

const SellerManualEntry = () => {
    const navigate = useNavigate();
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
        libraries: ['places']
    });

    const [map, setMap] = useState(null);
    const [position, setPosition] = useState(center);
    const [products] = useState(() => {
        const saved = localStorage.getItem('sellerProducts');
        try {
            const parsed = saved ? JSON.parse(saved) : null;
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    });
    const [userInfo] = useState(() => {
        const saved = localStorage.getItem('userInfo');
        try {
            const parsed = saved ? JSON.parse(saved) : null;
            return (parsed && typeof parsed === 'object') ? parsed : {};
        } catch (e) {
            return {};
        }
    });
    const [loading, setLoading] = useState(false);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [showQRSuccess, setShowQRSuccess] = useState(false);
    const [generatedTrk, setGeneratedTrk] = useState('');
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        productId: '',
        customerEmail: '',
        customerName: '',
        deliveryAddress: '',
        deliveryType: 'Standard',
        destination: '',
        lat: center.lat,
        lng: center.lng
    });

    const onLoad = useCallback(mapInstance => {
        setMap(mapInstance);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLookupCustomer = async () => {
        if (!formData.customerEmail) {
            setError('Please enter a customer email first.');
            return;
        }

        setLookupLoading(true);
        setError('');
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            const { data } = await axios.get(`${apiBase}/api/auth/find-customer/${formData.customerEmail}`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });

            if (data.location && data.location.latitude) {
                const newPos = { lat: data.location.latitude, lng: data.location.longitude };
                setPosition(newPos);
                if (map) map.panTo(newPos);

                setFormData(prev => ({
                    ...prev,
                    customerName: data.name,
                    deliveryAddress: data.location.addressLine1 + (data.location.city ? `, ${data.location.city}` : ''),
                    destination: data.location.city || '',
                    lat: data.location.latitude,
                    lng: data.location.longitude
                }));
            } else {
                setError('Customer found, but they have not set up their location details yet.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Customer not found. Please verify the email.');
        } finally {
            setLookupLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.lat || !formData.lng) {
            setError('Please fetch customer location using email first.');
            return;
        }

        setLoading(true);
        const trk = Math.random().toString(36).substring(2, 12).toUpperCase();
        const product = products.find(p => p.id.toString() === formData.productId);

        const newDelivery = {
            id: Date.now(),
            trackingCode: trk,
            productName: product ? product.name : 'Manual Item',
            ...formData,
            location: position,
            origin: userInfo.location || 'Not Configured',
            status: 'Pending Pickup',
            createdAt: new Date().toISOString()
        };

        const savedDels = localStorage.getItem('sellerDeliveries');
        let existing = [];
        try {
            const parsed = savedDels ? JSON.parse(savedDels) : null;
            existing = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            existing = [];
        }
        localStorage.setItem('sellerDeliveries', JSON.stringify([newDelivery, ...existing]));

        setGeneratedTrk(trk);
        setShowQRSuccess(true);
        setLoading(false);
    };

    return (
        <div className="app-container" style={{ background: 'var(--bg-color)', minHeight: '100vh' }}>
            <Navbar />

            <main className="main-content" style={{ display: 'flex', height: 'calc(100vh - 80px)', gap: 0, padding: 0 }}>
                {/* Left Panel: Form */}
                <div style={{ width: '480px', background: 'var(--panel-bg)', p: '2rem', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '2rem' }}>
                    <header style={{ marginBottom: '2rem' }}>
                        <button onClick={() => navigate('/seller')} style={{ background: 'transparent', border: 'none', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '1rem' }}>
                            <ArrowLeft size={20} /> Back to Hub
                        </button>
                        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Dispatch <span>Portal</span></h1>
                        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Auto-sync delivery location using Customer ID.</p>
                    </header>

                    {error && (
                        <div style={{ background: 'rgba(255, 60, 60, 0.1)', border: '1px solid var(--danger)', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', color: 'var(--danger)', fontSize: '0.9rem', display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <X size={18} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Select Catalog Product</label>
                            <select name="productId" value={formData.productId} onChange={handleInputChange} required style={{ width: '100%', cursor: 'pointer', padding: '0.8rem' }}>
                                <option value="">-- Choose Product --</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>)}
                                <option value="manual">Other / Custom Item</option>
                            </select>
                        </div>

                        <div style={{ padding: '1.5rem', background: 'rgba(255,107,0,0.05)', borderRadius: '16px', border: '1px solid rgba(255,107,0,0.2)' }}>
                            <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Mail size={18} className="brand-accent" /> Customer Lookup
                            </h4>
                            <div className="form-group" style={{ position: 'relative' }}>
                                <input
                                    name="customerEmail"
                                    type="email"
                                    value={formData.customerEmail}
                                    onChange={handleInputChange}
                                    placeholder="Enter user@email.com"
                                    style={{ width: '100%', paddingRight: '100px' }}
                                />
                                <button
                                    type="button"
                                    onClick={handleLookupCustomer}
                                    disabled={lookupLoading}
                                    style={{ position: 'absolute', right: '5px', top: '5px', bottom: '5px', background: 'var(--accent)', border: 'none', color: 'black', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', padding: '0 15px', fontSize: '0.8rem' }}
                                >
                                    {lookupLoading ? '...' : 'FETCH'}
                                </button>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                <Info size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                Fetches location and name automatically from user profile.
                            </p>
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Customer Name</label>
                            <input name="customerName" value={formData.customerName} onChange={handleInputChange} required placeholder="Populated from email" style={{ width: '100%' }} readOnly />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Delivery Address</label>
                            <textarea
                                name="deliveryAddress"
                                value={formData.deliveryAddress}
                                onChange={handleInputChange}
                                placeholder="Populated from email"
                                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '10px', padding: '1rem', minHeight: '80px', resize: 'none' }}
                                readOnly
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Service</label>
                                <select name="deliveryType" value={formData.deliveryType} onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem' }}>
                                    <option value="Standard">Standard</option>
                                    <option value="Express">Express</option>
                                    <option value="Same Day">Same Day</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Destination</label>
                                <input name="destination" value={formData.destination} onChange={handleInputChange} placeholder="Hub City" style={{ width: '100%' }} readOnly />
                            </div>
                        </div>

                        <button type="submit" disabled={loading || !formData.lat || formData.lat === center.lat} className="primary-btn pulse-glow" style={{ padding: '1.2rem', borderRadius: '12px', marginTop: '1rem', opacity: (!formData.lat || formData.lat === center.lat) ? 0.5 : 1 }}>
                            <Navigation size={20} style={{ marginRight: '10px' }} />
                            {loading ? 'Processing...' : 'CONFIRM DISPATCH'}
                        </button>
                    </form>
                </div>

                {/* Right Panel: Map Reference */}
                <div style={{ flex: 1, position: 'relative', background: '#050505' }}>
                    {isLoaded ? (
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={position}
                            zoom={14}
                            onLoad={onLoad}
                            options={{
                                styles: [{ elementType: "geometry", stylers: [{ color: "#242f3e" }] }, { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] }],
                                streetViewControl: false,
                                mapTypeControl: false,
                                draggable: false,
                                scrollwheel: false,
                                disableDoubleClickZoom: true
                            }}
                        >
                            <Marker
                                position={position}
                                animation={window.google.maps.Animation.DROP}
                                icon={{
                                    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z",
                                    fillColor: "#ff6600",
                                    fillOpacity: 1,
                                    strokeWeight: 2,
                                    strokeColor: "#ffffff",
                                    scale: 2,
                                    anchor: new window.google.maps.Point(12, 12)
                                }}
                            />
                        </GoogleMap>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
                            <p>Loading Map Radar...</p>
                        </div>
                    )}

                    <div style={{ position: 'absolute', bottom: '30px', right: '30px', background: 'rgba(0,0,0,0.85)', padding: '20px', borderRadius: '20px', border: '1px solid var(--border-color)', maxWidth: '300px', backdropFilter: 'blur(10px)' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: 'var(--accent)' }}>Live Target Sync</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>Map is now locked to detected customer coordinates. Manual pinning is disabled for accuracy.</p>
                        <div style={{ marginTop: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div style={{ width: '10px', height: '10px', background: '#00ff00', borderRadius: '50%', boxShadow: '0 0 10px #00ff00' }}></div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>COORDS: {formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}</span>
                        </div>
                    </div>

                    <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.8)', padding: '10px 20px', borderRadius: '30px', border: '1px solid var(--accent)', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'none' }}>
                        <div style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div>
                        Syncing with Global DB
                    </div>
                </div>
            </main>

            {/* QR Result Modal */}
            {showQRSuccess && (
                <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.95)', zIndex: 10000 }}>
                    <div className="panel" style={{ background: 'var(--panel-bg)', width: '450px', p: '2.5rem', textAlign: 'center', border: '2px solid var(--accent)', padding: '2.5rem', borderRadius: '24px' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Dispatch <span className="brand-accent">Confirmed</span></h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Tracking code and QR identity generated for driver pickup.</p>

                        <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', display: 'inline-block', marginBottom: '1.5rem' }}>
                            <QRCodeSVG value={generatedTrk} size={250} level="H" includeMargin={true} />
                        </div>

                        <div style={{ marginBottom: '2.5rem' }}>
                            <p style={{ fontSize: '0.8rem', color: '#888', letterSpacing: '4px', marginBottom: '5px' }}>TRACKING IDENTITY</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--accent)', fontFamily: 'monospace' }}>{generatedTrk}</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <button className="secondary-btn" style={{ padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <Download size={20} /> Save Image
                            </button>
                            <button onClick={() => navigate('/seller')} className="primary-btn" style={{ padding: '1rem', borderRadius: '12px', fontWeight: 'bold' }}>
                                Back to Hub
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.5; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default SellerManualEntry;

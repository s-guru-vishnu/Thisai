import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { PackageX, MapPin, Truck, Package, Clock, Phone, AlertTriangle, Route, User, ShieldCheck } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';

const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '16px',
    minHeight: '400px'
};

const darkModeStyles = [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
];

const CustomerTrack = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const trackingId = searchParams.get('id');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    const [parcelData, setParcelData] = useState(null);
    const [driverPos, setDriverPos] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [countdown, setCountdown] = useState(30);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
    });

    // Fetch Initial Data
    useEffect(() => {
        if (!trackingId) {
            setLoading(false);
            return;
        }

        const fetchParcelData = async () => {
            try {
                const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                
                // Fetch parcel info
                const { data: pData } = await axios.get(`${apiBase}/api/parcel/${trackingId}`, config);
                setParcelData(pData);
                setDriverPos(pData.driverLocation);

                // Fetch AI prediction
                const { data: pPredict } = await axios.get(`${apiBase}/api/predict/delay/${trackingId}`, config);
                setPrediction(pPredict);

                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Parcel not found or network error.');
                setLoading(false);
            }
        };

        fetchParcelData();
    }, [trackingId, userInfo.token]);

    // Live Driver Location Polling
    useEffect(() => {
        if (!trackingId || !parcelData || parcelData.status === 'Delivered') return;

        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

        const interval = setInterval(async () => {
            try {
                const { data } = await axios.get(`${apiBase}/api/parcel/live-location/${trackingId}`, config);
                if (data && data.driverLocation) {
                    setDriverPos(data.driverLocation);
                }
            } catch (err) {
                console.error('Polling error', err);
            }
        }, 5000); // 5 seconds

        return () => clearInterval(interval);
    }, [trackingId, parcelData, userInfo.token]);

    // Live ETA Countdown Update
    useEffect(() => {
        if (!trackingId || !parcelData || parcelData.status === 'Delivered') return;

        const cInterval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) return 30;
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(cInterval);
    }, [trackingId, parcelData]);

    if (loading) {
        return (
            <div className="app-container">
                <Navbar />
                <LoadingScreen fullScreen={true} message="Tuning AI Prediction Models..." />
            </div>
        );
    }

    if (!trackingId || error || !parcelData) {
        return (
            <div className="app-container">
                <Navbar />
                <main className="main-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div className="dashboard-card" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '50%', marginBottom: '1.5rem', border: '1px dashed var(--border-color)' }}>
                            <PackageX size={64} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <h2 style={{ marginBottom: '10px' }}>No Parcel Coming</h2>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 2rem auto' }}>
                            {error || "No tracking ID provided or parcel not found in our system."}
                        </p>
                        <button onClick={() => navigate('/customer')} className="primary-btn pulse-glow">
                            Go to Scanner
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    // Default map center somewhere between driver and destination if both exist
    const defaultCenter = driverPos || { lat: 13.0827, lng: 80.2707 };

    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
                    <div>
                        <h1>Live <span>Tracking</span></h1>
                        <p className="subtitle">Real-time updates for tracking ID: {trackingId}</p>
                    </div>
                </header>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Section 1: Top Full-Width Map */}
                    <div className="dashboard-card" style={{ padding: '1rem', minHeight: '450px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 10px' }}>
                            <h4 style={{ margin: 0 }}>Live Driver View</h4>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div className="status-badge" style={{ background: 'rgba(255,165,0,0.1)', color: 'orange', padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                    Driver: {parcelData.driverName}
                                </div>
                                <div className="status-badge" style={{ background: 'rgba(0,204,102,0.1)', color: 'var(--success)', padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                    ETA: {parcelData.eta}
                                </div>
                            </div>
                        </div>
                        <div style={{ flex: 1, position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
                            {isLoaded ? (
                                <GoogleMap
                                    mapContainerStyle={mapContainerStyle}
                                    center={defaultCenter}
                                    zoom={14}
                                    options={{ styles: darkModeStyles, disableDefaultUI: true, zoomControl: true }}
                                >
                                    {driverPos && (
                                        <Marker
                                            position={driverPos}
                                            icon={{
                                                path: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
                                                fillColor: '#FF6B00',
                                                fillOpacity: 1,
                                                strokeWeight: 0,
                                                scale: 1.5,
                                                anchor: new window.google.maps.Point(12, 12)
                                            }}
                                            onClick={() => setSelectedMarker('driver')}
                                        />
                                    )}
                                    {selectedMarker === 'driver' && driverPos && (
                                        <InfoWindow position={driverPos} onCloseClick={() => setSelectedMarker(null)}>
                                            <div style={{ color: '#111', padding: '8px' }}>
                                                <h4 style={{ margin: '0 0 5px 0' }}>Driver</h4>
                                                <p style={{ margin: 0, fontSize: '12px' }}>Updating location...</p>
                                            </div>
                                        </InfoWindow>
                                    )}
                                </GoogleMap>
                            ) : (
                                <LoadingScreen fullScreen={false} message="Initialising Neural Map..." />
                            )}
                        </div>
                    </div>

                    {/* Bottom Row: 4 Columns */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                        
                        {/* Section 2: Parcel Info */}
                        <div className="dashboard-card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
                                <div style={{ background: 'var(--accent)', color: 'white', padding: '8px', borderRadius: '8px' }}>
                                    <Package size={20} />
                                </div>
                                <h4 style={{ margin: 0, fontSize: '1rem' }}>Parcel Info</h4>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                <div>
                                    <p style={{ margin: '0 0 2px 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Product</p>
                                    <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem' }}>{parcelData.productName}</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 2px 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</p>
                                    <p style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem', color: parcelData.status === 'Delivered' ? 'var(--success)' : 'orange' }}>{parcelData.status}</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 2px 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sender</p>
                                    <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem' }}>{parcelData.senderName}</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 2px 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Delivery Address</p>
                                    <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.4' }}>{parcelData.deliveryAddress}</p>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Driver & ETA */}
                        <div className="dashboard-card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
                                <div style={{ background: 'rgba(255,107,0,0.1)', color: 'var(--accent)', padding: '8px', borderRadius: '8px' }}>
                                    <ShieldCheck size={18} />
                                </div>
                                <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Driver & ETA</h4>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <p style={{ margin: '0 0 6px 0', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Driver Name</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <p style={{ margin: 0, fontWeight: '700', fontSize: '1.2rem', color: 'white' }}>{parcelData.driverName}</p>
                                        <button className="secondary-btn" style={{ 
                                            width: '42px', 
                                            height: '42px', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            borderRadius: '12px',
                                            padding: 0,
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            background: 'rgba(255,255,255,0.05)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}>
                                            <Phone size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div style={{ 
                                    background: 'linear-gradient(135deg, rgba(255,165,0,0.1) 0%, rgba(255,107,0,0.05) 100%)', 
                                    padding: '1rem', 
                                    borderRadius: '12px', 
                                    border: '1px solid rgba(255,165,0,0.15)',
                                    marginTop: '0.2rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                        <Clock size={14} style={{ color: 'var(--accent)' }} />
                                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.5px' }}>LIVE ETA</span>
                                    </div>
                                    <p style={{ margin: 0, fontWeight: '800', fontSize: '1.4rem', color: 'white' }}>{parcelData.eta}</p>
                                    <p style={{ margin: '6px 0 0 0', fontSize: '0.75rem', color: 'var(--accent)', fontWeight: '500' }}>Update in {countdown}s</p>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: AI Prediction */}
                        <div className="dashboard-card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', background: prediction?.delayRisk === 'HIGH' ? 'rgba(255,59,48,0.05)' : 'var(--bg-panel)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
                                <div style={{ background: 'rgba(255,107,0,0.05)', color: 'var(--warning)', padding: '8px', borderRadius: '8px' }}>
                                    <AlertTriangle size={20} />
                                </div>
                                <h4 style={{ margin: 0, fontSize: '1rem' }}>AI Prediction</h4>
                            </div>
                            {prediction ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Risk</span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: prediction.delayRisk === 'HIGH' ? 'var(--danger)' : 'var(--success)' }}>{prediction.delayRisk}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Est. Delay</span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{prediction.delayMinutes}m</span>
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reason</p>
                                        <p style={{ margin: 0, fontSize: '0.8rem', fontStyle: 'italic' }}>"{prediction.reason}"</p>
                                    </div>
                                </div>
                            ) : (
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Analysis pending...</p>
                            )}
                        </div>

                        {/* Section 5: Shipment Timeline */}
                        <div className="dashboard-card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--info)', padding: '8px', borderRadius: '8px' }}>
                                    <Route size={20} />
                                </div>
                                <h4 style={{ margin: 0, fontSize: '1rem' }}>Timeline</h4>
                            </div>
                            <div className="timeline-container" style={{ position: 'relative', paddingLeft: '15px', maxHeight: '180px', overflowY: 'auto' }}>
                                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '6px', width: '1px', background: 'var(--border-color)', zIndex: 0 }}></div>
                                {parcelData.timeline && parcelData.timeline.map((step, idx) => (
                                    <div key={idx} style={{ position: 'relative', zIndex: 1, marginBottom: '1rem', display: 'flex', gap: '10px' }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: step.completed ? 'var(--success)' : 'var(--bg-panel)', border: `2px solid ${step.completed ? 'var(--success)' : 'var(--border-color)'}`, marginTop: '3px', marginLeft: '-6px' }}></div>
                                        <div>
                                            <p style={{ margin: '0 0 2px 0', fontWeight: '600', fontSize: '0.75rem', color: step.completed ? 'white' : 'var(--text-muted)' }}>{step.title}</p>
                                            {step.time && <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)' }}>{step.time}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                </div>
            </main>

            <style>{`
                @media (max-width: 1000px) {
                    .main-content {
                        padding: 1rem !important;
                    }
                    div[style*="grid-template-columns: repeat(4, 1fr)"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default CustomerTrack;

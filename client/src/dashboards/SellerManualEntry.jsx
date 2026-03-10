import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Truck, MapPin, Box, ArrowLeft, Navigation, Search, CheckCircle } from 'lucide-react';
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
    const [autocomplete, setAutocomplete] = useState(null);
    const [position, setPosition] = useState(center);
    const [products] = useState(() => JSON.parse(localStorage.getItem('sellerProducts') || '[]'));
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState('');

    const [formData, setFormData] = useState({
        productId: '',
        customerName: '',
        deliveryAddress: '',
        deliveryType: 'Standard',
        destination: '',
        lat: center.lat,
        lng: center.lng
    });

    const onLoad = useCallback(mapInstance => setMap(mapInstance), []);
    const onAutocompleteLoad = (autocompleteInstance) => setAutocomplete(autocompleteInstance);

    const onPlaceChanged = () => {
        if (autocomplete) {
            const place = autocomplete.getPlace();
            if (place.geometry) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const newPos = { lat, lng };
                setPosition(newPos);
                map.panTo(newPos);
                setFormData(prev => ({
                    ...prev,
                    deliveryAddress: place.formatted_address,
                    lat: lat.toFixed(6),
                    lng: lng.toFixed(6)
                }));
            }
        }
    };

    const handleMapClick = (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setPosition({ lat, lng });
        setFormData(prev => ({
            ...prev,
            lat: lat.toFixed(6),
            lng: lng.toFixed(6)
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        const product = products.find(p => p.id.toString() === formData.productId);
        const newDelivery = {
            id: Date.now(),
            trackingCode: Math.random().toString(36).substring(2, 12).toUpperCase(),
            productName: product ? product.name : 'Manual Item',
            ...formData,
            location: position,
            status: 'Pending Pickup',
            createdAt: new Date().toISOString()
        };

        const existing = JSON.parse(localStorage.getItem('sellerDeliveries') || '[]');
        localStorage.setItem('sellerDeliveries', JSON.stringify([newDelivery, ...existing]));

        setToast('Dispatch Successful!');
        setTimeout(() => navigate('/seller'), 1500);
    };

    return (
        <div className="app-container" style={{ background: 'var(--bg-color)', minHeight: '100vh' }}>
            <Navbar />

            {toast && (
                <div className="custom-toast" style={{ zIndex: 9999 }}>
                    <CheckCircle size={24} /> <span>{toast}</span>
                </div>
            )}

            <main className="main-content" style={{ display: 'flex', height: 'calc(100vh - 80px)', gap: 0, padding: 0 }}>
                {/* Left Panel: Form */}
                <div style={{ width: '450px', background: 'var(--panel-bg)', p: '2rem', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '2rem' }}>
                    <header style={{ marginBottom: '2rem' }}>
                        <button onClick={() => navigate('/seller')} style={{ background: 'transparent', border: 'none', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '1rem' }}>
                            <ArrowLeft size={20} /> Back to Hub
                        </button>
                        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Dispatch <span>Manual</span></h1>
                        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Configure delivery route & customer details.</p>
                    </header>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', mb: '0.5rem', fontWeight: '600' }}>Select Catalog Product</label>
                            <select name="productId" value={formData.productId} onChange={handleInputChange} required style={{ width: '100%', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', cursor: 'pointer' }}>
                                <option value="">-- Choose Product --</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>)}
                                <option value="manual">Other / Custom Item</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', mb: '0.5rem', fontWeight: '600' }}>Customer Name</label>
                            <input name="customerName" value={formData.customerName} onChange={handleInputChange} required placeholder="Full Name" style={{ width: '100%', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }} />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <label style={{ display: 'block', mb: '0.5rem', fontWeight: '600' }}>Full Delivery Address</label>
                            {isLoaded && (
                                <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged}>
                                    <input
                                        name="deliveryAddress"
                                        value={formData.deliveryAddress}
                                        onChange={handleInputChange}
                                        placeholder="Search for address or drop pin..."
                                        style={{ width: '100%', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', paddingRight: '40px' }}
                                    />
                                </Autocomplete>
                            )}
                            <Search size={18} style={{ position: 'absolute', right: '15px', top: '42px', color: 'var(--text-muted)' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', mb: '0.5rem', fontWeight: '600' }}>Service</label>
                                <select name="deliveryType" value={formData.deliveryType} onChange={handleInputChange} style={{ width: '100%', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}>
                                    <option value="Standard">Standard</option>
                                    <option value="Express">Express</option>
                                    <option value="Same Day">Same Day</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', mb: '0.5rem', fontWeight: '600' }}>Destination</label>
                                <input name="destination" value={formData.destination} onChange={handleInputChange} placeholder="Hub City" style={{ width: '100%', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }} />
                            </div>
                        </div>

                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px dashed var(--border-color)' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>📍 Active Coordinates:</p>
                            <p style={{ margin: '5px 0 0 0', fontWeight: '800', fontFamily: 'monospace', color: 'var(--accent)' }}>{formData.lat}, {formData.lng}</p>
                        </div>

                        <button type="submit" disabled={loading} className="primary-btn pulse-glow" style={{ padding: '1.2rem', borderRadius: '12px', marginTop: '1rem' }}>
                            <Navigation size={20} style={{ marginRight: '10px' }} />
                            {loading ? 'Processing...' : 'CONFIRM DISPATCH'}
                        </button>
                    </form>
                </div>

                {/* Right Panel: Map */}
                <div style={{ flex: 1, position: 'relative' }}>
                    {isLoaded ? (
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={position}
                            zoom={13}
                            onLoad={onLoad}
                            onClick={handleMapClick}
                            options={{
                                styles: [
                                    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                                    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                                    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                                    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] }
                                ],
                                streetViewControl: false,
                                mapTypeControl: false
                            }}
                        >
                            <Marker position={position} animation={window.google.maps.Animation.DROP} />
                        </GoogleMap>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
                            <p>Loading Map Terminal...</p>
                        </div>
                    )}

                    <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.8)', padding: '10px 20px', borderRadius: '30px', border: '1px solid var(--accent)', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'none' }}>
                        <div style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div>
                        Interactive Map Active
                    </div>
                </div>
            </main>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.5; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .pac-container {
                    background-color: #1a1a1a !important;
                    border: 1px solid #333 !important;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
                    font-family: inherit !important;
                    margin-top: 5px !important;
                }
                .pac-item {
                    border-top: 1px solid #222 !important;
                    color: #fff !important;
                    padding: 10px !important;
                    cursor: pointer !important;
                }
                .pac-item:hover { background-color: #222 !important; }
                .pac-item-query { color: #ff6600 !important; }
                .pac-matched { color: #ffcc00 !important; }
            `}</style>
        </div>
    );
};

export default SellerManualEntry;

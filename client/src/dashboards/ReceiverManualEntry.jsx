import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import Navbar from '../components/Navbar';
import { Package, MapPin, User, Scale, Tag, ArrowLeft, Save, Crosshair, Search, ShieldAlert } from 'lucide-react';
import '../styles/dashboard.css';

const containerStyle = {
    width: '100%',
    height: '350px'
};

const center = {
    lat: 13.0827,
    lng: 80.2707
};

const ReceiverManualEntry = () => {
    const navigate = useNavigate();
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
        libraries: ['places']
    });

    const [loading, setLoading] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [autocomplete, setAutocomplete] = useState(null);
    const [map, setMap] = useState(null);
    const [position, setPosition] = useState(center);

    const [newProduct, setNewProduct] = useState({
        productName: '',
        category: '',
        weight: '',
        seller: '',
        destination: '',
        customerName: '',
        deliveryAddress: '',
        deliveryType: 'Standard',
        lat: center.lat.toFixed(6),
        lng: center.lng.toFixed(6)
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({ ...prev, [name]: value }));

        if (name === 'lat' || name === 'lng') {
            const val = parseFloat(value);
            if (!isNaN(val)) {
                setPosition(prev => ({
                    ...prev,
                    [name]: val
                }));
            }
        }
    };

    const onAutocompleteLoad = (instance) => setAutocomplete(instance);
    const onMapLoad = useCallback(instance => setMap(instance), []);

    const onPlaceChanged = () => {
        if (autocomplete) {
            const place = autocomplete.getPlace();
            if (place.geometry) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const newPos = { lat, lng };
                setPosition(newPos);
                if (map) map.panTo(newPos);
                setNewProduct(prev => ({
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
        setNewProduct(prev => ({
            ...prev,
            lat: lat.toFixed(6),
            lng: lng.toFixed(6)
        }));
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            await axios.post(`${apiBase}/api/parcels`, newProduct);
            navigate('/receiver');
        } catch (err) {
            console.error("Failed to add product", err);
            const localP = {
                id: Date.now(),
                ...newProduct,
                status: 'Received',
                trackingCode: 'M-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
                createdAt: new Date().toISOString()
            };
            const localD = JSON.parse(localStorage.getItem('sellerDeliveries') || '[]');
            localStorage.setItem('sellerDeliveries', JSON.stringify([localP, ...localD]));
            navigate('/receiver');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container" style={{ background: 'var(--bg-color)', minHeight: '100vh' }}>
            <Navbar />

            <main className="main-content" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
                <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button onClick={() => navigate('/receiver')} style={{ background: 'transparent', border: 'none', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                        <ArrowLeft size={20} /> Dashboard
                    </button>
                    <div style={{ textAlign: 'right' }}>
                        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Manual <span>Entry</span></h1>
                        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Configure parcel logistics & verified location.</p>
                    </div>
                </header>

                <div className="panel" style={{ background: 'var(--panel-bg)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                    <form onSubmit={handleAddProduct} style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr' }}>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem', fontWeight: '600' }}>
                                <Package size={18} color="var(--accent)" /> Product Name
                            </label>
                            <input required name="productName" value={newProduct.productName} onChange={handleInputChange} placeholder="e.g. Gaming Laptop G5" style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }} />
                        </div>

                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem', fontWeight: '600' }}>
                                <Tag size={18} color="var(--accent)" /> Category
                            </label>
                            <input required name="category" value={newProduct.category} onChange={handleInputChange} placeholder="Electronics" style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }} />
                        </div>

                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem', fontWeight: '600' }}>
                                <Scale size={18} color="var(--accent)" /> Weight
                            </label>
                            <input required name="weight" value={newProduct.weight} onChange={handleInputChange} placeholder="2.5 kg" style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }} />
                        </div>

                        <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                            <h3 style={{ margin: '0 0 1.2rem 0', fontSize: '1.1rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <User size={20} /> Customer & Route Logistics
                            </h3>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '600' }}>Seller (From)</label>
                            <input required name="seller" value={newProduct.seller} onChange={handleInputChange} placeholder="Tech Masters" style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '600' }}>Destination Hub</label>
                            <input required name="destination" value={newProduct.destination} onChange={handleInputChange} placeholder="Central Warehouse" style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }} />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '600' }}>Customer Full Name</label>
                            <input required name="customerName" value={newProduct.customerName} onChange={handleInputChange} placeholder="John Doe" style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }} />
                        </div>

                        <div style={{ gridColumn: '1 / -1', position: 'relative' }}>
                            <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '600' }}>Delivery Address</label>
                            {isLoaded ? (
                                <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged}>
                                    <input
                                        required
                                        name="deliveryAddress"
                                        value={newProduct.deliveryAddress}
                                        onChange={handleInputChange}
                                        placeholder="Search for address or drop map pin..."
                                        style={{ width: '100%', padding: '0.9rem 1.2rem', paddingRight: '45px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                                    />
                                </Autocomplete>
                            ) : (
                                <input required name="deliveryAddress" value={newProduct.deliveryAddress} onChange={handleInputChange} placeholder="Fetching address services..." style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }} />
                            )}
                            <Search size={18} style={{ position: 'absolute', right: '15px', top: '42px', color: 'var(--text-muted)' }} />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <button type="button" onClick={() => setShowMap(!showMap)} style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: `1px solid ${showMap ? 'var(--accent)' : 'var(--border-color)'}`, background: 'rgba(0,0,0,0.2)', color: showMap ? 'var(--accent)' : 'var(--text-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 'bold' }}>
                                <MapPin size={18} /> {showMap ? 'Hide Map Terminal' : 'Select Location from Map'}
                            </button>
                        </div>

                        {showMap && (
                            <div style={{ gridColumn: '1 / -1', animation: 'fadeIn 0.3s ease' }}>
                                <div style={{ height: '350px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative', background: '#111' }}>
                                    {isLoaded ? (
                                        <GoogleMap
                                            mapContainerStyle={containerStyle}
                                            center={position}
                                            zoom={13}
                                            onLoad={onMapLoad}
                                            onClick={handleMapClick}
                                            options={{
                                                styles: [{ elementType: "geometry", stylers: [{ color: "#242f3e" }] }, { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] }],
                                                streetViewControl: false, mapTypeControl: false
                                            }}
                                        >
                                            <Marker position={position} />
                                        </GoogleMap>
                                    ) : (
                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Maps...</div>
                                    )}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>LATITUDE</label>
                                        <input name="lat" value={newProduct.lat} onChange={handleInputChange} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--accent)', fontWeight: 'bold', fontFamily: 'monospace' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>LONGITUDE</label>
                                        <input name="lng" value={newProduct.lng} onChange={handleInputChange} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--accent)', fontWeight: 'bold', fontFamily: 'monospace' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '600' }}>Service Type</label>
                            <select name="deliveryType" value={newProduct.deliveryType} onChange={handleInputChange} style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', cursor: 'pointer' }}>
                                <option value="Standard">Standard (3-5 Days)</option>
                                <option value="Express">Express (1-2 Days)</option>
                                <option value="Next Day">Next Day Delivery</option>
                            </select>
                        </div>

                        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                            <button type="button" onClick={() => navigate('/receiver')} style={{ padding: '1rem 2rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                            <button type="submit" disabled={loading} className="primary-btn pulse-glow" style={{ padding: '1rem 2.5rem', borderRadius: '12px', border: 'none', background: 'var(--accent)', color: '#000', cursor: 'pointer', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {loading ? 'Logging...' : <><Save size={20} /> Verify & Log Parcel</>}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .pac-container { background: #1a1a1a !important; border: 1px solid #333 !important; box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important; color: white !important; }
                .pac-item { color: #888 !important; border-top: 1px solid #222 !important; padding: 10px !important; }
                .pac-item:hover { background: #222 !important; }
                .pac-item-query { color: #ff6600 !important; }
            `}</style>
        </div>
    );
};

export default ReceiverManualEntry;

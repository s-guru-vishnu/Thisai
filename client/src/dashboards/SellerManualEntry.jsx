import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Truck, MapPin, Box, ArrowLeft, Navigation, Search, CheckCircle, Download, X, Mail, User, Info } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
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
    const [userInfo, setUserInfo] = useState(() => {
        const saved = localStorage.getItem('userInfo');
        try {
            const parsed = saved ? JSON.parse(saved) : null;
            return (parsed && typeof parsed === 'object') ? parsed : {};
        } catch (e) {
            return {};
        }
    });

    // Check for origin location if missing in profile
    const [sellerLocation, setSellerLocation] = useState(userInfo.location);
    const [nearestHub, setNearestHub] = useState(null);
    const [resolvedSellerHub, setResolvedSellerHub] = useState(null);
    const [resolvedCustomerHub, setResolvedCustomerHub] = useState(null);
    
    useEffect(() => {
        const fetchSellerLocation = async () => {
            try {
                const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
                const { data: addresses } = await axios.get(`${apiBase}/api/address`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                
                if (addresses && addresses.length > 0) {
                    const def = addresses.find(a => a.isDefault) || addresses[0];
                    const loc = {
                        addressLine1: def.houseNumber + ', ' + def.area,
                        city: def.townCity,
                        state: def.state,
                        postalCode: def.pincode,
                        latitude: def.latitude,
                        longitude: def.longitude
                    };
                    setSellerLocation(loc);

                    // Find Nearest Hub (Manual Specification Prioritized)
                    try {
                        const { data: hubs } = await axios.get(`${apiBase}/api/auth/warehouses`, {
                            headers: { Authorization: `Bearer ${userInfo.token}` }
                        });
                        
                        let foundHub = null;
                        if (def.nearestHub) {
                            foundHub = hubs.find(h => h._id === def.nearestHub);
                        }

                        if (!foundHub) {
                            const matchedHubs = hubs.filter(h => h.hub?.toLowerCase() === loc.city.toLowerCase() || h.city?.toLowerCase() === loc.city.toLowerCase());
                            // Prioritize warehouse role over manager role
                            foundHub = matchedHubs.find(h => h.role === 'warehouse') || matchedHubs.find(h => h.role === 'manager');
                        }
                        
                        if (foundHub) {
                            setNearestHub(foundHub.name);
                        }
                    } catch (hubErr) {
                        console.error("Failed to fetch hubs", hubErr);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch seller addresses", err);
            }
        };
        fetchSellerLocation();
    }, [userInfo.token]);
    const [loading, setLoading] = useState(false);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [showQRSuccess, setShowQRSuccess] = useState(false);
    const [generatedTrk, setGeneratedTrk] = useState('');
    const [logisticsPath, setLogisticsPath] = useState([]);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        productId: '',
        customerEmail: '',
        customerName: '',
        customerId: '',
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
                    customerId: data._id,
                    deliveryAddress: data.location.addressLine1 + (data.location.city ? `, ${data.location.city}` : ''),
                    destination: data.location.city || '',
                    lat: data.location.latitude,
                    lng: data.location.longitude
                }));

                console.log("FETCH API Response Data:", data);
                if (data.sellerWarehouse) {
                    console.log("Setting Seller WH:", data.sellerWarehouse.name);
                    setResolvedSellerHub(data.sellerWarehouse);
                } else {
                    console.warn("No seller warehouse returned from API");
                }
                
                if (data.nearestWarehouse) {
                    console.log("Setting Customer WH:", data.nearestWarehouse.name);
                    setResolvedCustomerHub(data.nearestWarehouse);
                } else {
                    console.warn("No customer warehouse returned from API");
                }

                if (data.intermediateHubs) {
                    setIntermediateHubs(data.intermediateHubs);
                }

                // Fetch Logistics Path
                const startHub = data.sellerWarehouse?.hub || sellerLocation?.city || userInfo.hub || 'Chennai';
                const endHub = data.nearestWarehouse?.hub || data.location?.city || 'Madurai';
                
                try {
                    const pathRes = await axios.get(`${apiBase}/api/logistics/path?startHub=${startHub}&endHub=${endHub}`, {
                        headers: { Authorization: `Bearer ${userInfo.token}` }
                    });
                    if (pathRes.data && pathRes.data.stops) {
                        setLogisticsPath(pathRes.data.stops);
                    }
                } catch (pathErr) {
                    console.error("Path calculation failed", pathErr);
                }
            } else {
                setError('Customer found, but location details are missing. Please enter the delivery address manually.');
                setFormData(prev => ({
                    ...prev,
                    customerName: data.name,
                    customerId: data._id
                }));
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Customer not found. Please verify the email.');
        } finally {
            setLookupLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.customerId || !formData.deliveryAddress || !formData.destination) {
            setError('Please find a customer and provide both a delivery address and a destination city.');
            return;
        }

        setLoading(true);
        setError('');
        
        const trk = Math.random().toString(36).substring(2, 12).toUpperCase();
        const product = products.find(p => p.id.toString() === formData.productId);

        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            
            // Prepare package data for backend
            const parcelData = {
                parcelId: trk, // Use generated tracking as parcelId
                productName: product ? product.name : 'Manual Item',
                category: product ? product.category || 'General' : 'General',
                weight: '1kg', // Default or from form if we add it
                seller: userInfo.name || 'Seller',
                destination: formData.destination,
                customer: formData.customerId,
                customerName: formData.customerName,
                deliveryAddress: formData.deliveryAddress,
                deliveryType: formData.deliveryType,
                status: 'Dispatched'
            };

            await axios.post(`${apiBase}/api/parcels`, parcelData, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });

            setGeneratedTrk(trk);
            setShowQRSuccess(true);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to dispatch product. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
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
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Truck size={14} /> DISPATCHING FROM:
                            </p>
                            <p style={{ margin: '5px 0 0 0', fontWeight: 'bold' }}>
                                {sellerLocation?.addressLine1 ? `${sellerLocation.addressLine1}, ${sellerLocation.city}` : 'No Origin Location Detected'}
                            </p>
                            {nearestHub && (
                                <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--accent)', fontWeight: '600' }}>
                                    Nearest Hub: {nearestHub}
                                </p>
                            )}
                            {!sellerLocation?.addressLine1 && (
                                <p style={{ margin: '5px 0 0 0', fontSize: '0.75rem', color: 'var(--danger)' }}>
                                    Warning: No dispatch hub set. Please add an address in your profile.
                                </p>
                            )}
                        </div>

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
                            
                            {(resolvedSellerHub || resolvedCustomerHub) && (
                                <div style={{ display: 'grid', gridTemplateColumns: resolvedSellerHub && resolvedCustomerHub ? '1fr 1fr' : '1fr', gap: '1rem', marginTop: '1rem' }}>
                                    {resolvedSellerHub && (
                                        <div style={{ padding: '0.8rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                            <p style={{ margin: 0, fontSize: '0.65rem', color: '#3b82f6', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px' }}>
                                                <Navigation size={10} style={{ marginRight: '4px' }} /> Seller Origin
                                            </p>
                                            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', fontWeight: 'bold', color: 'white' }}>{resolvedSellerHub.name}</p>
                                        </div>
                                    )}
                                    {resolvedCustomerHub && (
                                        <div style={{ padding: '0.8rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                                            <p style={{ margin: 0, fontSize: '0.65rem', color: '#22c55e', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px' }}>
                                                <MapPin size={10} style={{ marginRight: '4px' }} /> Target Hub
                                            </p>
                                            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', fontWeight: 'bold', color: 'white' }}>{resolvedCustomerHub.name}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                <Info size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                Fetches location and name automatically from user profile.
                            </p>
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Customer Name</label>
                            <input name="customerName" value={formData.customerName} onChange={handleInputChange} required placeholder="Enter customer name or fetch by email" style={{ width: '100%' }} />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Delivery Address</label>
                            <textarea
                                name="deliveryAddress"
                                value={formData.deliveryAddress}
                                onChange={handleInputChange}
                                placeholder="Enter full delivery address"
                                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '10px', padding: '1rem', minHeight: '80px', resize: 'none' }}
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
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Destination City</label>
                                <input name="destination" value={formData.destination} onChange={handleInputChange} required placeholder="e.g. Madurai" style={{ width: '100%' }} />
                            </div>
                        </div>

                        <button type="submit" disabled={loading || !formData.customerId || !formData.deliveryAddress} className="primary-btn pulse-glow" style={{ padding: '1.2rem', borderRadius: '12px', marginTop: '1rem', opacity: (!formData.customerId || !formData.deliveryAddress) ? 0.5 : 1 }}>
                            <Navigation size={20} style={{ marginRight: '10px' }} />
                            {loading ? 'Processing...' : 'CONFIRM DISPATCH'}
                        </button>
                        {logisticsPath.length > 0 && (
                            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6' }}>
                                    <Truck size={18} /> LOGISTICS CHAIN
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                    {logisticsPath.map((stop, idx) => {
                                        // Match stop name with our resolved intermediate hubs to show the actual manager names if possible
                                        const cityName = stop.destination.replace(' Hub', '');
                                        const managerMatch = intermediateHubs.find(h => h.city.toLowerCase() === cityName.toLowerCase());
                                        const label = managerMatch ? managerMatch.name : stop.destination;

                                        return (
                                            <div key={idx} style={{ position: 'relative', paddingLeft: '25px', paddingBottom: '15px' }}>
                                                {idx !== logisticsPath.length - 1 && (
                                                    <div style={{ position: 'absolute', left: '7px', top: '15px', bottom: '0', width: '2px', background: 'rgba(59, 130, 246, 0.3)', borderStyle: 'dashed' }}></div>
                                                )}
                                                <div style={{ position: 'absolute', left: '0', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: idx === 0 || idx === logisticsPath.length - 1 ? '#3b82f6' : 'transparent', border: '2px solid #3b82f6', zIndex: 1 }}></div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: idx === 0 || idx === logisticsPath.length - 1 ? 'white' : '#ddd' }}>
                                                    {idx === 0 && resolvedSellerHub ? resolvedSellerHub.name : 
                                                     idx === logisticsPath.length - 1 && resolvedCustomerHub ? resolvedCustomerHub.name : 
                                                     label}
                                                 </div>
                                                 <div style={{ fontSize: '0.7rem', color: '#71717a' }}>
                                                     {idx === 0 ? 'Origin Hub' : idx === logisticsPath.length - 1 ? 'Final Hub' : 'Intermediate Hub'}
                                                     {managerMatch && idx !== 0 && idx !== logisticsPath.length - 1 && ` • ${managerMatch.region} Region`}
                                                 </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
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
                        <LoadingScreen fullScreen={false} message="Calibrating Delivery Radar..." />
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

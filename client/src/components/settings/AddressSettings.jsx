import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Plus, Trash2, Home, Building, Briefcase, Info, Phone, Navigation } from 'lucide-react';
import LocationPickerModal from '../modals/LocationPickerModal';

const AddressSettings = ({ userContext, showToast }) => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMap, setShowMap] = useState(false);

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            const config = { headers: { Authorization: `Bearer ${userContext.token}` } };
            const { data } = await axios.get(`${apiBase}/api/address`, config);
            setAddresses(data);
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleAddAddress = () => {
        // If geolocation is available, get current position first then open map
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
                    setShowMap(true);
                },
                () => {
                    // Fallback: open map with default coords
                    setCurrentCoords(null);
                    setShowMap(true);
                }
            );
        } else {
            setCurrentCoords(null);
            setShowMap(true);
        }
    };

    const [currentCoords, setCurrentCoords] = useState(null);

    const onLocationConfirm = async (coords, displayAddress) => {
        setShowMap(false);

        // Reverse geocode to get structured address
        let addressData = {
            fullName: userContext.name || 'My Address',
            phone: userContext.phone || '',
            latitude: coords.lat,
            longitude: coords.lng,
            houseNumber: '-',
            area: displayAddress || `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`,
            townCity: '',
            state: '',
            pincode: '',
            country: 'India',
            addressType: 'House',
        };

        try {
            const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=${apiKey}`);
            const data = await response.json();

            if (data.results && data.results[0]) {
                const components = data.results[0].address_components;
                const getComp = (type) => components.find(c => c.types.includes(type))?.long_name || '';

                addressData = {
                    ...addressData,
                    houseNumber: getComp('subpremise') || getComp('premise') || getComp('street_number') || '-',
                    area: getComp('sublocality_level_1') || getComp('sublocality') || getComp('route') || data.results[0].formatted_address,
                    townCity: getComp('locality') || getComp('postal_town') || '',
                    state: getComp('administrative_area_level_1') || '',
                    pincode: getComp('postal_code') || '',
                    country: getComp('country') || 'India',
                };
            }
        } catch (err) {
            console.error('Geocoding error:', err);
        }

        // Save to DB
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            const config = { headers: { Authorization: `Bearer ${userContext.token}` } };
            await axios.post(`${apiBase}/api/address`, addressData, config);
            showToast('Address saved!');
            fetchAddresses();
        } catch (error) {
            showToast('Failed to save address', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this address?')) return;
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            const config = { headers: { Authorization: `Bearer ${userContext.token}` } };
            await axios.delete(`${apiBase}/api/address/${id}`, config);
            showToast('Address removed');
            fetchAddresses();
        } catch (error) {
            showToast('Failed to delete', 'error');
        }
    };

    const getIcon = (type) => {
        switch(type) {
            case 'House': return <Home size={18} />;
            case 'Apartment': return <Building size={18} />;
            case 'Business': return <Briefcase size={18} />;
            default: return <Info size={18} />;
        }
    };

    return (
        <div>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0 }}>My Addresses</h2>
                <button onClick={handleAddAddress} className="primary-btn" style={{ fontSize: '0.85rem', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} /> Add New Address
                </button>
            </header>

            {loading ? (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    <div className="skeleton-loader" style={{ height: '100px' }}></div>
                    <div className="skeleton-loader" style={{ height: '100px' }}></div>
                </div>
            ) : addresses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '2px dashed var(--border-color)', borderRadius: '20px', cursor: 'pointer' }} onClick={handleAddAddress}>
                    <Navigation size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                    <h3 style={{ color: 'var(--text-muted)', margin: '0 0 8px 0' }}>No addresses saved</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Click here or press "Add New Address" to pick a location on the map</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {addresses.map(addr => (
                        <div key={addr._id} style={{
                            padding: '1.5rem',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '16px',
                            border: addr.isDefault ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            transition: 'transform 0.2s',
                        }}>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ background: 'rgba(var(--accent-rgb), 0.1)', color: 'var(--accent)', padding: '12px', borderRadius: '12px', height: 'fit-content' }}>
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 6px 0', fontWeight: '600', fontSize: '1rem' }}>
                                        {addr.area || 'Saved Location'}
                                    </p>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                                        {[addr.houseNumber !== '-' && addr.houseNumber, addr.townCity, addr.state, addr.pincode].filter(Boolean).join(', ')}
                                    </p>
                                    {addr.latitude && (
                                        <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                            📍 {addr.latitude.toFixed(5)}, {addr.longitude.toFixed(5)}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => handleDelete(addr._id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '8px' }} onMouseOver={e => e.currentTarget.style.color = '#ff3b30'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <LocationPickerModal
                isOpen={showMap}
                onClose={() => setShowMap(false)}
                onConfirm={onLocationConfirm}
                initialLocation={currentCoords}
            />
        </div>
    );
};

export default AddressSettings;

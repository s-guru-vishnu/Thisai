import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Plus, Trash2, Eye, Star, Navigation, CheckCircle2 } from 'lucide-react';
import LocationPickerModal from '../modals/LocationPickerModal';

const AddressSettings = ({ userContext, showToast }) => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMap, setShowMap] = useState(false);
    const [viewLocation, setViewLocation] = useState(null); // For viewing a saved location on map
    const [showViewMap, setShowViewMap] = useState(false);

    const getToken = () => userContext.token || JSON.parse(localStorage.getItem('userInfo') || '{}').token;

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            const config = { headers: { Authorization: `Bearer ${getToken()}` } };
            const { data } = await axios.get(`${apiBase}/api/address`, config);
            setAddresses(data);

            // Auto-set first address as default if none are default
            if (data.length > 0 && !data.some(a => a.isDefault)) {
                await handleSetDefault(data[0]._id, true);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const [currentCoords, setCurrentCoords] = useState(null);

    const handleAddAddress = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
                    setShowMap(true);
                },
                () => {
                    setCurrentCoords(null);
                    setShowMap(true);
                }
            );
        } else {
            setCurrentCoords(null);
            setShowMap(true);
        }
    };

    const onLocationConfirm = async (locationData) => {
        setShowMap(false);

        const { latitude, longitude, address, city, state, postalCode, country } = locationData;

        let addressData = {
            fullName: userContext.name || 'My Address',
            phone: userContext.phone || '',
            latitude: latitude,
            longitude: longitude,
            houseNumber: '-',
            area: address || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
            townCity: city || '',
            state: state || '',
            pincode: postalCode || '',
            country: country || 'India',
            addressType: 'House',
            isDefault: addresses.length === 0, // First address is default
        };

        try {
            const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`);
            const data = await response.json();

            if (data.results && data.results[0]) {
                const components = data.results[0].address_components;
                const getComp = (type) => components.find(c => c.types.includes(type))?.long_name || '';

                addressData = {
                    ...addressData,
                    houseNumber: getComp('subpremise') || getComp('premise') || getComp('street_number') || '-',
                    area: getComp('sublocality_level_1') || getComp('sublocality') || getComp('route') || data.results[0].formatted_address,
                    townCity: city || getComp('locality') || getComp('postal_town') || '',
                    state: state || getComp('administrative_area_level_1') || '',
                    pincode: postalCode || getComp('postal_code') || '',
                    country: country || getComp('country') || 'India',
                };
            }
        } catch (err) {
            console.error('Geocoding error:', err);
        }

        // Save to DB
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            const config = { headers: { Authorization: `Bearer ${getToken()}` } };
            await axios.post(`${apiBase}/api/address`, addressData, config);
            showToast('Address saved!');
            
            if (addressData.isDefault) {
                const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                userInfo.location = {
                    addressLine1: addressData.area,
                    city: addressData.townCity,
                    state: addressData.state,
                    country: addressData.country,
                    postalCode: addressData.pincode,
                    latitude: addressData.latitude,
                    longitude: addressData.longitude
                };
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
            }

            fetchAddresses();
        } catch (error) {
            showToast('Failed to save address', 'error');
        }
    };

    const handleSetDefault = async (id, silent = false) => {
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            const config = { headers: { Authorization: `Bearer ${getToken()}` } };
            await axios.put(`${apiBase}/api/address/${id}`, { isDefault: true }, config);
            if (!silent) {
                showToast('Default address updated!');
            }

            // Update local storage
            const { data: addressesData } = await axios.get(`${apiBase}/api/address`, config);
            const defAddr = addressesData.find(a => a._id === id);
            if (defAddr) {
                const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                userInfo.location = {
                    addressLine1: defAddr.area,
                    city: defAddr.townCity,
                    state: defAddr.state,
                    country: defAddr.country,
                    postalCode: defAddr.pincode,
                    latitude: defAddr.latitude,
                    longitude: defAddr.longitude
                };
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
            }

            fetchAddresses();
        } catch (error) {
            if (!silent) showToast('Failed to update default', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this address?')) return;
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            const config = { headers: { Authorization: `Bearer ${getToken()}` } };
            await axios.delete(`${apiBase}/api/address/${id}`, config);
            showToast('Address removed');
            fetchAddresses();
        } catch (error) {
            showToast('Failed to delete', 'error');
        }
    };

    const handleViewLocation = (addr) => {
        if (addr.latitude && addr.longitude) {
            setViewLocation({ lat: addr.latitude, lng: addr.longitude });
            setShowViewMap(true);
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
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {addresses.map((addr, index) => (
                        <div key={addr._id} style={{
                            padding: '1.25rem 1.5rem',
                            background: addr.isDefault ? 'rgba(var(--accent-rgb, 255, 107, 0), 0.04)' : 'rgba(255,255,255,0.02)',
                            borderRadius: '14px',
                            border: addr.isDefault ? '1.5px solid var(--accent)' : '1px solid var(--border-color)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.2s ease',
                        }}>
                            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                <div style={{
                                    background: addr.isDefault ? 'var(--accent)' : 'rgba(var(--accent-rgb, 255, 107, 0), 0.1)',
                                    color: addr.isDefault ? 'white' : 'var(--accent)',
                                    padding: '10px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                        <p style={{ margin: 0, fontWeight: '600', fontSize: '1rem', color: 'var(--text-main)' }}>
                                            Address {index + 1}
                                        </p>
                                        {addr.isDefault && (
                                            <span style={{
                                                background: 'var(--accent)',
                                                color: 'white',
                                                padding: '2px 10px',
                                                borderRadius: '20px',
                                                fontSize: '0.7rem',
                                                fontWeight: '700',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                letterSpacing: '0.3px',
                                            }}>
                                                <CheckCircle2 size={10} /> Default
                                            </span>
                                        )}
                                    </div>
                                    {addr.latitude && (
                                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                            📍 {addr.latitude.toFixed(5)}, {addr.longitude.toFixed(5)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Action Icons */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {/* View Location */}
                                <button
                                    onClick={() => handleViewLocation(addr)}
                                    title="View location on map"
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        padding: '8px',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseOver={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'rgba(var(--accent-rgb, 255, 107, 0), 0.1)'; }}
                                    onMouseOut={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <Eye size={17} />
                                </button>

                                {/* Set as Default */}
                                {!addr.isDefault && (
                                    <button
                                        onClick={() => handleSetDefault(addr._id)}
                                        title="Set as default address"
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--text-muted)',
                                            cursor: 'pointer',
                                            padding: '8px',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseOver={e => { e.currentTarget.style.color = 'var(--warning, #F7931A)'; e.currentTarget.style.background = 'rgba(247, 147, 26, 0.1)'; }}
                                        onMouseOut={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <Star size={17} />
                                    </button>
                                )}

                                {/* Delete */}
                                <button
                                    onClick={() => handleDelete(addr._id)}
                                    title="Delete address"
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        padding: '8px',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseOver={e => { e.currentTarget.style.color = '#ff3b30'; e.currentTarget.style.background = 'rgba(255, 59, 48, 0.1)'; }}
                                    onMouseOut={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <Trash2 size={17} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Map for adding new address */}
            <LocationPickerModal
                isOpen={showMap}
                onClose={() => setShowMap(false)}
                onConfirm={onLocationConfirm}
                initialLocation={currentCoords}
            />

            {/* Read-only map for viewing a saved location */}
            <LocationPickerModal
                isOpen={showViewMap}
                onClose={() => setShowViewMap(false)}
                onConfirm={() => setShowViewMap(false)}
                initialLocation={viewLocation}
                readOnly={true}
            />
        </div>
    );
};

export default AddressSettings;

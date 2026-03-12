import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { MapPin, Plus, Trash2, Edit3, Home, Building, Briefcase, Info, CheckCircle2, ChevronRight, Map as MapIcon } from 'lucide-react';
import Toast from '../components/Toast';

const AddressBook = () => {
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toastData, setToastData] = useState(null);

    const showToast = (message, type = 'success') => {
        setToastData({ message, type });
    };

    const fetchAddresses = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';

            const { data } = await axios.get(`${apiBase}/api/address`, config);
            setAddresses(data);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            showToast('Failed to load addresses', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';

            await axios.delete(`${apiBase}/api/address/${id}`, config);
            showToast('Address deleted');
            fetchAddresses();
        } catch (error) {
            showToast('Failed to delete address', 'error');
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
        <div className="app-container">
            <Navbar />
            {toastData && <Toast message={toastData.message} type={toastData.type} onClose={() => setToastData(null)} />}
            <main className="main-content" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
                <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2rem' }}>Your Addresses</h1>
                        <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>Manage your delivery locations and preferences</p>
                    </div>
                    <Link to="/customer/addresses/add" className="primary-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
                        <Plus size={20} /> Add Address
                    </Link>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {/* Add New Address Card */}
                    <Link to="/customer/addresses/add" style={{ 
                        textDecoration: 'none',
                        border: '2px dashed var(--border-color)',
                        borderRadius: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '15px',
                        minHeight: '220px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        color: 'var(--text-muted)'
                    }} className="add-card-hover">
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '50%' }}>
                            <Plus size={40} />
                        </div>
                        <span style={{ fontSize: '1.2rem', fontWeight: '600' }}>Add Address</span>
                    </Link>

                    {loading ? (
                        [1, 2].map(i => <div key={i} className="skeleton-loader" style={{ height: '220px', borderRadius: '20px' }}></div>)
                    ) : (
                        addresses.map(addr => (
                            <div key={addr._id} className="dashboard-card" style={{ 
                                padding: '1.5rem', 
                                position: 'relative', 
                                border: addr.isDefault ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                                boxShadow: addr.isDefault ? '0 0 20px rgba(var(--accent-rgb), 0.1)' : 'none'
                            }}>
                                {addr.isDefault && (
                                    <div style={{ 
                                        position: 'absolute', top: '15px', right: '15px', 
                                        background: 'var(--accent)', color: 'white', 
                                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', 
                                        display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold'
                                    }}>
                                        <CheckCircle2 size={12} /> Default
                                    </div>
                                )}
                                
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '1rem', color: 'var(--accent)' }}>
                                    {getIcon(addr.addressType)}
                                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{addr.addressType}</span>
                                </div>

                                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{addr.fullName}</h3>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-color)', lineHeight: '1.4' }}>
                                    {addr.houseNumber}, {addr.area}<br />
                                    {addr.landmark && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Landmark: {addr.landmark}<br /></span>}
                                    {addr.townCity}, {addr.state} {addr.pincode}<br />
                                    {addr.country}
                                </p>
                                <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <Phone size={14} style={{ marginRight: '5px', verticalAlign: 'middle' }} /> {addr.phone}
                                </p>

                                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '15px' }}>
                                    <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }} onMouseOver={e => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                                        <Edit3 size={16} /> Edit
                                    </button>
                                    <button onClick={() => handleDelete(addr._id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }} onMouseOver={e => e.currentTarget.style.color = 'var(--danger)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                                        <Trash2 size={16} /> Delete
                                    </button>
                                    {addr.latitude && (
                                        <div title="Has Coordinates" style={{ marginLeft: 'auto', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                                            <MapIcon size={14} /> GPS
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
            <style>{`
                .add-card-hover:hover {
                    border-color: var(--accent) !important;
                    background: rgba(var(--accent-rgb), 0.05) !important;
                    color: var(--accent) !important;
                    transform: translateY(-5px);
                }
            `}</style>
        </div>
    );
};

export default AddressBook;

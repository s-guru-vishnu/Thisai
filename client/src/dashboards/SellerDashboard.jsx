import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Package, Truck, MapPin, CheckCircle, PlusCircle, Tag, Navigation, Box, ExternalLink, X } from 'lucide-react';
import LocationRequiredModal from '../components/modals/LocationRequiredModal';
import '../styles/dashboard.css';
import '../styles/seller.css';

const containerStyle = {
    width: '100%',
    height: '500px'
};

const center = {
    lat: 13.0827,
    lng: 80.2707
};

const SellerDashboard = () => {
    const navigate = useNavigate();
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
    });

    const [map, setMap] = useState(null);

    const onLoad = useCallback(function callback(mapInstance) {
        setMap(mapInstance);
    }, []);

    const onUnmount = useCallback(function callback(mapInstance) {
        setMap(null);
    }, []);

    // Load initial state from local storage or use defaults
    const [products, setProducts] = useState(() => {
        const saved = localStorage.getItem('sellerProducts');
        return saved ? JSON.parse(saved) : [{ id: 1, name: 'Sample Watch', category: 'Accessories', weight: '0.1 kg', price: '1999', description: 'Luxury watch' }];
    });

    const [deliveries, setDeliveries] = useState(() => {
        const saved = localStorage.getItem('sellerDeliveries');
        return saved ? JSON.parse(saved) : [];
    });

    // Sync to localStorage
    useEffect(() => {
        localStorage.setItem('sellerProducts', JSON.stringify(products));
    }, [products]);

    useEffect(() => {
        localStorage.setItem('sellerDeliveries', JSON.stringify(deliveries));
    }, [deliveries]);



    const [productForm, setProductForm] = useState({
        name: '',
        category: '',
        weight: '',
        price: '',
        description: ''
    });

    const [toastMsg, setToastMsg] = useState('');
    const [showProductModal, setShowProductModal] = useState(false);

    const checkLocationAndProceed = (action) => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const location = userInfo?.location;
        
        if (!location || !location.addressLine1 || !location.city) {
            setIsLocationModalOpen(true);
        } else {
            action();
        }
    };

    const showToast = (msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 4000); // 4 sec
    };

    const handleCreateProduct = (e) => {
        e.preventDefault();
        if (!productForm.name || !productForm.price) return;

        const newProduct = {
            id: Date.now(),
            ...productForm
        };

        setProducts([...products, newProduct]);
        setProductForm({ name: '', category: '', weight: '', price: '', description: '' });
        setShowProductModal(false);
        showToast(`Product "${newProduct.name}" saved to catalog!`);
    };

    const stats = {
        total: deliveries.length,
        pending: deliveries.filter(d => d.status === 'Pending Pickup' || !d.status).length,
        transit: deliveries.filter(d => d.status === 'In Transit').length,
        delivered: deliveries.filter(d => d.status === 'Delivered').length,
    };

    return (
        <div className="app-container">
            <Navbar />

            {/* Custom Interactive Toast */}
            {toastMsg && (
                <div className="custom-toast">
                    <CheckCircle size={24} />
                    <span>{toastMsg}</span>
                </div>
            )}

            <main className="main-content" style={{ paddingTop: '2rem' }}>
                <header className="dashboard-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>Seller <span>Portal</span></h1>
                        <p className="subtitle">Manage Products & Dispatch Deliveries seamlessly</p>
                    </div>
                    <div>
                        <Link to="/seller/deliveries" className="primary-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Truck size={18} /> Manage Deliveries
                        </Link>
                    </div>
                </header>

                <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div className="stat-widget" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <div className="stat-info" style={{ width: '100%' }}>
                            <h4 style={{ color: 'var(--text-muted)' }}>Total Dispatched</h4>
                            <p className="value" style={{ fontSize: '2rem', margin: '5px 0' }}>{stats.total}</p>
                        </div>
                    </div>
                    <div className="stat-widget" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '5px', borderColor: 'rgba(255,165,0,0.3)' }}>
                        <div className="stat-info" style={{ width: '100%' }}>
                            <h4 style={{ color: 'orange' }}>Pending Pickup</h4>
                            <p className="value" style={{ fontSize: '2rem', margin: '5px 0' }}>{stats.pending}</p>
                        </div>
                    </div>
                    <div className="stat-widget" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '5px', borderColor: 'rgba(0,153,255,0.3)' }}>
                        <div className="stat-info" style={{ width: '100%' }}>
                            <h4 style={{ color: '#0099ff' }}>In Transit</h4>
                            <p className="value" style={{ fontSize: '2rem', margin: '5px 0' }}>{stats.transit}</p>
                        </div>
                    </div>
                    <div className="stat-widget" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '5px', borderColor: 'rgba(0,204,102,0.3)' }}>
                        <div className="stat-info" style={{ width: '100%' }}>
                            <h4 style={{ color: 'var(--success)' }}>Delivered</h4>
                            <p className="value" style={{ fontSize: '2rem', margin: '5px 0' }}>{stats.delivered}</p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-grid seller-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>

                    {/* Action Cards */}
                    <div className="action-module" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }} onClick={() => checkLocationAndProceed(() => setShowProductModal(true))}>
                        <div className="icon-container" style={{ background: 'rgba(255,102,0,0.1)', padding: '2rem', borderRadius: '50%', marginBottom: '1rem', color: 'var(--accent)' }}>
                            <PlusCircle size={48} />
                        </div>
                        <h2 style={{ margin: 0, paddingInline: '20px' }}>Add New Product</h2>
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px', paddingInline: '40px' }}>Register a new item into your digital inventory catalog to allow quick dispatching later.</p>
                    </div>

                    <div className="action-module" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }} onClick={() => checkLocationAndProceed(() => navigate('/seller/dispatch'))}>
                        <div className="icon-container" style={{ background: 'rgba(0,204,102,0.1)', padding: '2rem', borderRadius: '50%', marginBottom: '1rem', color: 'var(--success)' }}>
                            <MapPin size={48} />
                        </div>
                        <h2 style={{ margin: 0, paddingInline: '20px' }}>Dispatch Delivery</h2>
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px', paddingInline: '40px' }}>Select an existing product and map it to a delivery location for immediate tracking using Google Maps.</p>
                    </div>
                </div>

                {/* Interactive visual product list */}
                {products.length > 0 && (
                    <div className="products-wrapper" style={{ marginTop: '3rem' }}>
                        <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>Your Product Catalog ({products.length})</h3>
                        <div className="products-grid">
                            {products.slice(0).reverse().map(p => (
                                <div className="mini-product-card" key={p.id}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div className="mini-p-icon"><Box size={18} /></div>
                                        <p className="price">₹{p.price}</p>
                                    </div>
                                    <h5>{p.name}</h5>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Product Modal */}
            {showProductModal && (
                <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-modal-btn" onClick={() => setShowProductModal(false)}><X size={24} /></button>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0 }}>
                            <PlusCircle className="brand-accent" size={24} /> Step 1: Create Product
                        </h2>
                        <form className="seller-form" onSubmit={handleCreateProduct}>
                            <div className="form-group">
                                <label>Product Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter product name"
                                    value={productForm.name}
                                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="location-inputs" style={{ marginTop: '10px' }}>
                                <div className="form-group">
                                    <label>Category</label>
                                    <input
                                        type="text"
                                        name="category"
                                        placeholder="e.g. Electronics"
                                        value={productForm.category}
                                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Weight</label>
                                    <input
                                        type="text"
                                        name="weight"
                                        placeholder="e.g. 1.5 kg"
                                        value={productForm.weight}
                                        onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginTop: '10px' }}>
                                <label>Price (₹)</label>
                                <input
                                    type="number"
                                    name="price"
                                    placeholder="1999"
                                    value={productForm.price}
                                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                    required
                                    min="0"
                                    step="1"
                                />
                            </div>
                            <button type="submit" className="primary-btn pulse-glow mt-2" style={{ width: '100%', marginTop: '15px' }}>
                                Save Product to Catalog
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <LocationRequiredModal 
                isOpen={isLocationModalOpen} 
                onClose={() => setIsLocationModalOpen(false)} 
            />
        </div>
    );
};

export default SellerDashboard;

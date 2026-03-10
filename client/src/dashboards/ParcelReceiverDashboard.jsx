import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import DashboardCard from '../components/DashboardCard';
import { QrCode, X, CheckSquare, Package, Truck, Search } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const ParcelReceiverDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [scanner, setScanner] = useState(null);
    const [scanResult, setScanResult] = useState(null);

    const [newProduct, setNewProduct] = useState({
        productName: '', category: '', weight: '', seller: '', destination: '', customerName: '', deliveryAddress: '', deliveryType: ''
    });

    useEffect(() => {
        const fetchParcels = async () => {
            try {
                // Try fetching from backend first
                const res = await axios.get('http://localhost:5000/api/parcels');
                setProducts(res.data);
            } catch (err) {
                console.error("Failed to fetch parcels", err);
                // Fallback to localStorage if backend fails or is not ready
                const localData = JSON.parse(localStorage.getItem('sellerDeliveries') || '[]');
                setProducts(localData);
            }
        };
        fetchParcels();
    }, []);

    const toggleScanner = () => {
        if (!showScanner) {
            setShowScanner(true);
            setTimeout(() => {
                const newScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
                newScanner.render((decodedText) => {
                    handleScanSuccess(decodedText.toUpperCase());
                    newScanner.clear();
                    setShowScanner(false);
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

    const handleScanSuccess = (code) => {
        // Sync with either server or localStorage
        const localDeliveries = JSON.parse(localStorage.getItem('sellerDeliveries') || '[]');
        const updated = localDeliveries.map(d => {
            if (d.trackingCode === code) {
                return { ...d, status: 'Received' };
            }
            return d;
        });
        localStorage.setItem('sellerDeliveries', JSON.stringify(updated));
        setProducts(updated);
        setScanResult(`Successfully Received Package: ${code}`);
        setTimeout(() => setScanResult(null), 5000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/parcels', newProduct);
            setProducts([res.data, ...products]);
            setIsModalOpen(false);
            setNewProduct({
                productName: '', category: '', weight: '', seller: '', destination: '', customerName: '', deliveryAddress: '', deliveryType: ''
            });
        } catch (err) {
            console.error("Failed to add product", err);
            // Fallback for demo
            const localP = { ...newProduct, id: Date.now(), status: 'Received', trackingCode: 'MANUAL-' + Date.now().toString().slice(-4) };
            const localD = JSON.parse(localStorage.getItem('sellerDeliveries') || '[]');
            localStorage.setItem('sellerDeliveries', JSON.stringify([localP, ...localD]));
            setProducts([localP, ...products]);
            setIsModalOpen(false);
        }
    };

    const totalReceived = products.length;
    const pendingDispatch = products.filter(p => !p.status || p.status === 'Received' || p.status === 'Pending Dispatch').length;
    const inTransit = products.filter(p => p.status === 'Dispatched to Hub' || p.status === 'In Transit').length;
    const issues = products.filter(p => p.status && (p.status.toLowerCase().includes('issue') || p.status.toLowerCase().includes('return'))).length;

    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">
                <header className="dashboard-header">
                    <div>
                        <h1>Receiver <span>Portal</span></h1>
                        <p className="subtitle">First-mile collection: Scan seller QR codes to receive packages.</p>
                    </div>
                    <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {scanResult && <div style={{ background: 'rgba(0,204,102,0.1)', color: 'var(--success)', padding: '0.8rem 1.2rem', borderRadius: '8px', border: '1px solid var(--success)', fontSize: '0.9rem' }}>{scanResult}</div>}
                        <button onClick={toggleScanner} className="secondary-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.8rem 1.5rem', borderRadius: '8px', background: showScanner ? 'var(--accent)' : 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                            <QrCode size={20} />
                            {showScanner ? 'Close Scanner' : 'Scan Seller QR'}
                        </button>
                        <button className="primary-btn pulse-glow" onClick={() => setIsModalOpen(true)}>Manual Entry</button>
                    </div>
                </header>

                {showScanner && (
                    <div style={{ maxWidth: '600px', margin: '0 auto 2rem auto', animation: 'fadeIn 0.3s ease' }}>
                        <div id="reader" style={{ width: '100%', borderRadius: '12px', border: '2px solid var(--accent)', overflow: 'hidden', background: '#000' }}></div>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '10px' }}>Point camera at the seller's package QR code</p>
                    </div>
                )}

                <section className="dashboard-grid">
                    <DashboardCard title="Received from Sellers" value={totalReceived.toLocaleString()} trend="+15% today" icon="🏪" trendPositive={true} />
                    <DashboardCard title="Pending Hub Dispatch" value={pendingDispatch.toLocaleString()} trend="Next truck in 30m" icon="⏳" trendPositive={true} />
                    <DashboardCard title="In Transit to Warehouse" value={inTransit.toLocaleString()} trend="-50 from yesterday" icon="🚚" trendPositive={true} />
                    <DashboardCard title="Seller Issues/Returns" value={issues.toLocaleString()} trend="+2 new issues" icon="⚠️" trendPositive={false} />
                </section>

                <section className="product-table-section" style={{ marginTop: '2rem' }}>
                    <div className="panel" style={{ background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <h2 style={{ margin: 0 }}>Product Data & Delivery Details</h2>
                            <input
                                type="text"
                                placeholder="Search Product ID or Name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', minWidth: '250px' }}
                            />
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>ID / Tracking</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Product Info</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Seller</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Delivery Details</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.filter(p =>
                                        p.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        p.parcelId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        p.trackingCode?.toLowerCase().includes(searchTerm.toLowerCase())
                                    ).map(product => (
                                        <tr key={product._id || product.id || product.parcelId} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                                            <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                                                <div style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>{product.trackingCode || 'No Code'}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {product.parcelId || product.id}</div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: '500', color: 'var(--text-color)' }}>{product.productName}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{product.category} • {product.weight}</div>
                                            </td>
                                            <td style={{ padding: '1rem', color: 'var(--text-color)' }}>{product.seller}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: '500', color: 'var(--text-color)' }}>To: {product.customerName}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{product.deliveryAddress}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Type: {product.deliveryType} • Dest: {product.destination}</div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.3rem 0.6rem',
                                                    borderRadius: '20px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 'bold',
                                                    background: product.status === 'Received' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 152, 0, 0.15)',
                                                    color: product.status === 'Received' ? '#4CAF50' : '#FF9800'
                                                }}>
                                                    {product.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <button style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--accent-light, #007bff)', background: 'transparent', color: 'var(--accent-light, #007bff)', cursor: 'pointer', fontWeight: 'bold' }}>Action</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {products.filter(p => p.productName.toLowerCase().includes(searchTerm.toLowerCase()) || (p.parcelId && p.parcelId.toLowerCase().includes(searchTerm.toLowerCase()))).length === 0 && (
                                        <tr>
                                            <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No products found matching your search.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <section className="recent-activity" style={{ marginTop: '2rem' }}>
                    <div className="activity-panel">
                        <h2>Recent Collections & Dispatches</h2>
                        <div className="activity-list">
                            <div className="activity-item">
                                <div className="activity-icon info">🏪</div>
                                <div className="activity-details">
                                    <h4>Seller Drop-off</h4>
                                    <p>Received 50 parcels from Seller "Tech Gadgets Store".</p>
                                </div>
                                <span className="activity-time">5 mins ago</span>
                            </div>
                            <div className="activity-item">
                                <div className="activity-icon success">🚚</div>
                                <div className="activity-details">
                                    <h4>Dispatched to Warehouse</h4>
                                    <p>Batch #HUB-991 dispatched to Main City Warehouse.</p>
                                </div>
                                <span className="activity-time">25 mins ago</span>
                            </div>
                            <div className="activity-item">
                                <div className="activity-icon warning">🚨</div>
                                <div className="activity-details">
                                    <h4>Packaging Issue</h4>
                                    <p>Flagged poor packaging from Seller "Fashion Hub", pending review.</p>
                                </div>
                                <span className="activity-time">1 hr ago</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'var(--panel-bg)', color: 'var(--text-color)', padding: '2.5rem', borderRadius: '16px', width: '90%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
                        <h2 style={{ marginTop: 0, marginBottom: '2rem', fontSize: '1.8rem', color: 'var(--text-color)', textAlign: 'center' }}>📥 Receive New Product</h2>
                        <form onSubmit={handleAddProduct} style={{ display: 'grid', gap: '1.2rem', gridTemplateColumns: '1fr 1fr' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-color)' }}>Product Name</label>
                                <input required name="productName" value={newProduct.productName} onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', outline: 'none', transition: 'box-shadow 0.2s' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-color)' }}>Category</label>
                                <input required name="category" value={newProduct.category} onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-color)' }}>Weight</label>
                                <input required name="weight" placeholder="e.g. 1.5 kg" value={newProduct.weight} onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-color)' }}>Seller (From)</label>
                                <input required name="seller" value={newProduct.seller} onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-color)' }}>Destination Hub</label>
                                <input required name="destination" value={newProduct.destination} onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', outline: 'none' }} />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-color)' }}>Customer Name (To)</label>
                                <input required name="customerName" value={newProduct.customerName} onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', outline: 'none' }} />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-color)' }}>Delivery Address</label>
                                <input required name="deliveryAddress" value={newProduct.deliveryAddress} onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', outline: 'none' }} />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-color)' }}>Delivery Type</label>
                                <select required name="deliveryType" value={newProduct.deliveryType} onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', outline: 'none' }}>
                                    <option value="">Select Type</option>
                                    <option value="Standard">Standard</option>
                                    <option value="Express">Express</option>
                                    <option value="Next Day">Next Day</option>
                                </select>
                            </div>

                            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.8rem 1.5rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                                <button type="submit" className="primary-btn pulse-glow" style={{ padding: '0.8rem 1.5rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '600', background: 'var(--accent-color, #007bff)', color: '#fff', boxShadow: '0 4px 15px rgba(0,123,255,0.3)' }}>✅ Save Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParcelReceiverDashboard;

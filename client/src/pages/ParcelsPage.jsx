import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import { Package, Search, Filter, Plus, Truck, MapPin, User, ChevronRight, X, Save } from 'lucide-react';
import axios from 'axios';
import LocationRequiredModal from '../components/modals/LocationRequiredModal';
import LoadingScreen from '../components/LoadingScreen';

const ParcelsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [parcels, setParcels] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [drivers, setDrivers] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        fetchParcels();
        fetchDropdownData();
    }, []);

    const checkLocationAndOpenModal = () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const location = userInfo?.location;
        
        if (!location || !location.addressLine1 || !location.city) {
            setIsLocationModalOpen(true);
        } else {
            setIsModalOpen(true);
        }
    };

    const fetchParcels = async () => {
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
            const { data } = await axios.get(`${apiBase}/api/admin/parcels`, config);
            setParcels(data || []);
        } catch (err) {
            console.error("Failed to fetch parcels", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
            
            const [usersRes, warehousesRes] = await Promise.all([
                axios.get(`${apiBase}/api/admin/users`, config),
                axios.get(`${apiBase}/api/admin/warehouses`, config)
            ]);
            
            setDrivers(usersRes.data.filter(u => u.role === 'driver'));
            setCustomers(usersRes.data.filter(u => u.role === 'customer'));
            setWarehouses(warehousesRes.data);
        } catch (err) {
            console.error("Failed to fetch dropdown data", err);
        }
    };

    const filteredParcels = parcels.filter(parcel => {
        const query = searchTerm.toLowerCase();
        const matchesSearch = (parcel.parcelId && parcel.parcelId.toLowerCase().includes(query)) ||
                              (parcel.seller && parcel.seller.toLowerCase().includes(query)) ||
                              (parcel.sender && parcel.sender.toLowerCase().includes(query)) ||
                              (parcel.customerName && parcel.customerName.toLowerCase().includes(query)) ||
                              (parcel.receiver && parcel.receiver.toLowerCase().includes(query));
        
        const matchesStatus = statusFilter === 'All' || parcel.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleCreateParcel = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const customerId = formData.get('customer');
        const selectedCustomer = customers.find(c => c._id === customerId);

        const parcelData = {
            productName: formData.get('productName'),
            category: formData.get('category'),
            weight: formData.get('weight'),
            seller: formData.get('seller'),
            destination: formData.get('destination'),
            customer: customerId,
            customerName: selectedCustomer ? selectedCustomer.name : 'Unknown',
            deliveryAddress: formData.get('deliveryAddress'),
            deliveryType: formData.get('deliveryType'),
            status: formData.get('status'),
            assignedDriver: formData.get('assignedDriver') || undefined,
            warehouse: formData.get('warehouse') || undefined
        };

        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
            await axios.post(`${apiBase}/api/admin/parcels`, parcelData, config);
            setIsModalOpen(false);
            fetchParcels();
        } catch (err) {
            console.error("Failed to create parcel", err);
            alert("Failed to create parcel");
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'In Transit': return { bg: 'rgba(23,162,184,0.1)', color: 'var(--info)', border: 'rgba(23,162,184,0.2)' };
            case 'Pending': return { bg: 'rgba(247,147,26,0.1)', color: 'var(--warning)', border: 'rgba(247,147,26,0.2)' };
            case 'Delayed': return { bg: 'rgba(255,59,48,0.1)', color: 'var(--danger)', border: 'rgba(255,59,48,0.2)' };
            case 'Delivered': return { bg: 'rgba(22,199,132,0.1)', color: 'var(--success)', border: 'rgba(22,199,132,0.2)' };
            default: return { bg: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: 'rgba(255,255,255,0.1)' };
        }
    };

    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">
                <header className="dashboard-header">
                    <div>
                        <h1>Parcel <span>Logs</span></h1>
                        <p className="subtitle">Real-time status tracking and logistics pipeline.</p>
                    </div>
                    <button className="primary-btn pulse-glow flex items-center gap-2" onClick={checkLocationAndOpenModal} style={{ padding: '0.6rem 1.2rem', height: '42px' }}>
                        <Plus size={18} /> Create Parcel
                    </button>
                </header>

                <div className="table-controls" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="search-box" style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                        <input 
                            type="text" 
                            placeholder="Search Parcel ID, Sender, or Receiver..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', height: '46px', padding: '0 12px 0 40px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-panel)', color: 'white', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div className="filter-box" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Filter size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        <select 
                            className="secondary-btn" 
                            style={{ width: 'auto', padding: '0 24px 0 40px', appearance: 'none', cursor: 'pointer', height: '46px', border: '1px solid var(--border-color)', margin: 0, boxSizing: 'border-box' }}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Delayed">Delayed</option>
                            <option value="Delivered">Delivered</option>
                        </select>
                    </div>
                </div>

                <div className="table-responsive" style={{ overflowX: 'auto', background: 'var(--bg-panel)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Tracking ID</th>
                                <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Logistics Route</th>
                                <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Entities</th>
                                <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Assigned</th>
                                <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '1.2rem', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ padding: '0' }}>
                                    <LoadingScreen fullScreen={false} message="Synchronizing Parcel Pipeline..." />
                                </td></tr>
                            ) : filteredParcels.map((parcel) => {
                                const st = getStatusStyle(parcel.status || 'Pending');
                                return (
                                    <tr key={parcel._id || parcel.parcelId} style={{ borderBottom: '1px solid var(--border-color)' }} className="hover:bg-card-hover">
                                        <td style={{ padding: '1.2rem' }}>
                                            <div style={{ fontWeight: '700', color: 'var(--accent)', fontSize: '1rem' }}>{parcel.parcelId || parcel._id || 'N/A'}</div>
                                        </td>
                                        <td style={{ padding: '1.2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                                                <span>{parcel.warehouse?.name || parcel.pickup || 'Central Hub'}</span>
                                                <ChevronRight size={14} className="text-muted" />
                                                <span>{parcel.destination || 'Pending'}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.2rem' }}>
                                            <div style={{ fontSize: '0.9rem', color: 'white' }}>From: {parcel.seller || parcel.sender || 'Unknown'}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>To: {parcel.customer?.name || parcel.customerName || parcel.receiver || 'Unknown'}</div>
                                        </td>
                                        <td style={{ padding: '1.2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
                                                    <User size={14} className="text-accent" />
                                                </div>
                                                <span style={{ fontSize: '0.9rem' }}>{parcel.assignedDriver?.name || parcel.driver || 'Unassigned'}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.2rem' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                fontWeight: '700',
                                                background: st.bg,
                                                color: st.color,
                                                border: `1px solid ${st.border}`
                                            }}>
                                                {parcel.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                                            <button className="secondary-btn" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>View Details</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {isModalOpen && (
                    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                        <div className="dashboard-card" style={{ width: '100%', maxWidth: '750px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}><Plus className="text-accent" /> Create New Parcel</h2>
                                <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
                            </div>
                            <form onSubmit={handleCreateParcel} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Product Name</label>
                                    <input name="productName" type="text" required style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }} />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Category</label>
                                    <select name="category" required style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }}>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Fashion">Fashion</option>
                                        <option value="Appliances">Appliances</option>
                                        <option value="Books">Books</option>
                                        <option value="Others">Others</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Weight (kg)</label>
                                    <input name="weight" type="text" placeholder="e.g., 2.5kg" required style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }} />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Seller (Sender)</label>
                                    <input name="seller" type="text" required style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }} />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Customer (Receiver)</label>
                                    <select name="customer" required style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }}>
                                        <option value="">Select Customer</option>
                                        {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Delivery Address</label>
                                    <textarea name="deliveryAddress" required style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', minHeight: '80px', resize: 'vertical' }} />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Warehouse (Pickup Hub)</label>
                                    <select name="warehouse" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }}>
                                        <option value="">Select Warehouse</option>
                                        {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Destination</label>
                                    <input name="destination" type="text" placeholder="City name" required style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }} />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Assigned Driver</label>
                                    <select name="assignedDriver" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }}>
                                        <option value="">Unassigned</option>
                                        {drivers.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Delivery Type</label>
                                    <select name="deliveryType" required style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }}>
                                        <option value="Standard">Standard</option>
                                        <option value="Express">Express</option>
                                        <option value="Same Day">Same Day</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Initial Status</label>
                                    <select name="status" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }}>
                                        <option value="Pending">Pending</option>
                                        <option value="Received">Received</option>
                                        <option value="In Transit">In Transit</option>
                                    </select>
                                </div>
                                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="secondary-btn" style={{ flex: 1, height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0 }}>Cancel</button>
                                    <button type="submit" className="primary-btn flex items-center justify-center gap-2" style={{ flex: 1, height: '46px', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Save size={18} /> Create Parcel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <LocationRequiredModal 
                    isOpen={isLocationModalOpen} 
                    onClose={() => setIsLocationModalOpen(false)} 
                />
            </main>
            <style>{`
                .hover\:bg-card-hover:hover {
                    background-color: var(--bg-card-hover);
                }
            `}</style>
        </div>
    );
};

export default ParcelsPage;

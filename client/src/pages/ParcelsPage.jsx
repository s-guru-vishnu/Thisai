import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import { Package, Search, Filter, Plus, Truck, MapPin, User, ChevronRight } from 'lucide-react';

const ParcelsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const parcels = [
        { id: 'PRC-9910', sender: 'Tech Masters', receiver: 'John Doe', pickup: 'Warehouse A', destination: 'City Hub', driver: 'Mike Ross', status: 'In Transit' },
        { id: 'PRC-9911', sender: 'Fashion Hub', receiver: 'Sarah Wilson', pickup: 'Warehouse B', destination: 'North Hub', driver: 'Sarah Wilson', status: 'Pending' },
        { id: 'PRC-9912', sender: 'Gadget Store', receiver: 'Alex Smith', pickup: 'Warehouse A', destination: 'West Hub', driver: 'Mike Ross', status: 'Delayed' },
        { id: 'PRC-9913', sender: 'Home Goods', receiver: 'Emma Brown', pickup: 'Main Warehouse', destination: 'City Hub', driver: 'Unassigned', status: 'Delivered' }
    ];

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
                    <button className="primary-btn pulse-glow flex items-center gap-2">
                        <Plus size={18} /> Create Parcel
                    </button>
                </header>

                <div className="table-controls" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="search-box" style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                        <input 
                            type="text" 
                            placeholder="Search Parcel ID, Sender, or Receiver..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-panel)', color: 'white' }}
                        />
                    </div>
                    <button className="secondary-btn flex items-center gap-2" style={{ width: 'auto' }}>
                        <Filter size={18} /> Status All
                    </button>
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
                            {parcels.map((parcel) => {
                                const st = getStatusStyle(parcel.status);
                                return (
                                    <tr key={parcel.id} style={{ borderBottom: '1px solid var(--border-color)' }} className="hover:bg-card-hover">
                                        <td style={{ padding: '1.2rem' }}>
                                            <div style={{ fontWeight: '700', color: 'var(--accent)', fontSize: '1rem' }}>{parcel.id}</div>
                                        </td>
                                        <td style={{ padding: '1.2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                                                <span>{parcel.pickup}</span>
                                                <ChevronRight size={14} className="text-muted" />
                                                <span>{parcel.destination}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.2rem' }}>
                                            <div style={{ fontSize: '0.9rem', color: 'white' }}>From: {parcel.sender}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>To: {parcel.receiver}</div>
                                        </td>
                                        <td style={{ padding: '1.2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
                                                    <User size={14} className="text-accent" />
                                                </div>
                                                <span style={{ fontSize: '0.9rem' }}>{parcel.driver}</span>
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

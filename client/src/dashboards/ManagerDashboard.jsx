import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DashboardCard from '../components/DashboardCard';
import { Box, X, CheckSquare, Package, Truck, Search, QrCode, MapPin, Users, Zap, BarChart3, AlertCircle, Loader } from 'lucide-react';

const ManagerDashboard = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isManager = userInfo.role === 'manager';
    const userHub = userInfo.hub || 'Coimbatore';
    const userRegion = userInfo.region || 'Western Tamil Nadu';

    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [selectedHub, setSelectedHub] = useState(isManager ? userHub : 'coimbatore');

    // Auto-Assign State
    const [assigning, setAssigning] = useState(false);
    const [assignResult, setAssignResult] = useState(null);
    const [assignError, setAssignError] = useState('');

    const fetchData = async () => {
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            const resParcels = await axios.get(`${apiBase}/api/parcels`, config);
            setProducts(resParcels.data);

            const resDrivers = await axios.get(`${apiBase}/api/manager/drivers`, config);
            setDrivers(resDrivers.data);
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
            const localData = JSON.parse(localStorage.getItem('sellerDeliveries') || '[]');
            setProducts(localData);
        }
    };

    useEffect(() => {
        fetchData();
    }, [userInfo.token]);

    // Auto-Assign Handler
    const handleAutoAssign = async () => {
        if (!window.confirm('This will fairly distribute all unassigned parcels to your delivery drivers based on workload fairness. Continue?')) return;
        
        setAssigning(true);
        setAssignError('');
        setAssignResult(null);

        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            const { data } = await axios.post(`${apiBase}/api/manager/auto-assign`, {}, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setAssignResult(data);
            fetchData(); // Refresh data
        } catch (err) {
            setAssignError(err.response?.data?.message || 'Auto-assign failed. Please try again.');
        } finally {
            setAssigning(false);
        }
    };

    // Stats
    const teamDrivers = drivers.filter(d => d.assignedManager === userInfo._id);
    const unassignedCount = products.filter(p => !p.assignedDriver && p.status !== 'Delivered').length;
    const intraRegion = products.length;
    const incomingInterHub = Math.floor(products.length * 0.4) || 24;
    const outgoingInterHub = Math.floor(products.length * 0.3) || 15;
    const bottlenecks = products.filter(p => p.status && (p.status.toLowerCase().includes('issue') || p.status.toLowerCase().includes('return'))).length;

    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">
                <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1>{isManager ? `${userRegion} Manager` : 'Regional Hub Manager'}</h1>
                        <p className="subtitle">Hub-to-hub flows, tracking, and truck utilization for <strong>{selectedHub}</strong>.</p>
                    </div>
                    <div className="hub-selector" style={{ background: 'var(--panel-bg)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>📍 Assigned Hub/Region:</label>
                        {isManager ? (
                            <div style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 'bold' }}>
                                {userHub} ({userRegion})
                            </div>
                        ) : (
                            <select
                                value={selectedHub}
                                onChange={(e) => setSelectedHub(e.target.value)}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-accent)',
                                    background: 'var(--bg-color)',
                                    color: 'var(--text-main)',
                                    fontSize: '0.95rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    outline: 'none'
                                }}
                            >
                                <option value="coimbatore">Western TN (Coimbatore)</option>
                                <option value="chennai">Northern TN (Chennai)</option>
                                <option value="trichy">Central TN (Trichy)</option>
                                <option value="madurai">Southern TN (Madurai)</option>
                                <option value="tirunelveli">Coastal South (Tirunelveli)</option>
                            </select>
                        )}
                    </div>
                </header>

                <section className="dashboard-grid">
                    <DashboardCard title="Intra-Region Deliveries" value={intraRegion.toLocaleString()} trend="To local district loops" icon="📦" trendPositive={true} />
                    <DashboardCard title="Incoming Transfers" value={incomingInterHub.toLocaleString()} trend="From Border Hubs" icon="📥" trendPositive={true} />
                    <DashboardCard title="Outgoing Transfers" value={outgoingInterHub.toLocaleString()} trend="Dispatched to Borders" icon="📤" trendPositive={true} />
                    <DashboardCard title="Delayed / Bottlenecks" value={bottlenecks.toLocaleString()} trend="Requires attention" icon="⚠️" trendPositive={false} />
                </section>

                <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <div 
                        onClick={() => window.location.href = '/manager/users'}
                        style={{ 
                            background: 'rgba(255,255,255,0.03)', 
                            padding: '1.5rem', 
                            borderRadius: '15px', 
                            border: '1px solid var(--border-color)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            transition: 'all 0.3s'
                        }}
                        className="quick-action-card"
                    >
                        <div style={{ background: 'rgba(33,150,243,0.1)', color: '#2196f3', padding: '12px', borderRadius: '12px' }}>
                            <Users size={24} />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>My Team</h4>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage and recruit drivers for your regional hub.</p>
                        </div>
                    </div>
                    
                    <div 
                        onClick={() => window.location.href = '/settings/addresses'}
                        style={{ 
                            background: 'rgba(255,255,255,0.03)', 
                            padding: '1.5rem', 
                            borderRadius: '15px', 
                            border: '1px solid var(--border-color)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            transition: 'all 0.3s'
                        }}
                        className="quick-action-card"
                    >
                        <div style={{ background: 'rgba(255,107,0,0.1)', color: 'var(--accent)', padding: '12px', borderRadius: '12px' }}>
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Hub Addresses</h4>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage regional hub and collection addresses.</p>
                        </div>
                    </div>
                </div>

                {/* ═══ FAIR ASSIGNMENT ENGINE ═══ */}
                <section style={{ marginTop: '2rem' }}>
                    <div style={{ 
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.08))', 
                        padding: '2rem', 
                        borderRadius: '20px', 
                        border: '1px solid rgba(139,92,246,0.25)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Decorative glow */}
                        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
                            <div style={{ flex: '1', minWidth: '280px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', padding: '10px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(139,92,246,0.3)' }}>
                                        <Zap size={22} color="white" />
                                    </div>
                                    <div>
                                        <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800' }}>Fair Assignment Engine</h2>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>FS<sub>i</sub> = α(W<sub>i</sub>) + β(B<sub>i</sub>)  |  α=0.7  β=0.3</p>
                                    </div>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '500px' }}>
                                    Automatically distributes deliveries across your team using <strong style={{ color: 'var(--text-main)' }}>workload fairness scoring</strong>. 
                                    Considers current active load (W<sub>i</sub>) and historical burden ratio (B<sub>i</sub>) to ensure no driver is over-burdened.
                                </p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', minWidth: '260px' }}>
                                <div style={{ display: 'flex', gap: '20px', padding: '12px 20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#8b5cf6' }}>{unassignedCount}</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Unassigned</div>
                                    </div>
                                    <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#3b82f6' }}>{teamDrivers.length}</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Team Drivers</div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAutoAssign}
                                    disabled={assigning || teamDrivers.length === 0 || unassignedCount === 0}
                                    style={{
                                        padding: '14px 28px',
                                        borderRadius: '14px',
                                        border: 'none',
                                        background: assigning ? '#555' : 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                                        color: 'white',
                                        fontSize: '0.95rem',
                                        fontWeight: '800',
                                        cursor: assigning ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        boxShadow: assigning ? 'none' : '0 6px 25px rgba(139,92,246,0.4)',
                                        transition: 'all 0.3s ease',
                                        width: '100%',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {assigning ? (
                                        <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Computing Fairness...</>
                                    ) : (
                                        <><Zap size={18} /> Auto-Assign Deliveries</>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {assignError && (
                            <div style={{ 
                                marginTop: '1.5rem', 
                                padding: '12px 16px', 
                                background: 'rgba(239,68,68,0.1)', 
                                border: '1px solid rgba(239,68,68,0.3)', 
                                borderRadius: '10px', 
                                color: '#ef4444', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px', 
                                fontSize: '0.9rem' 
                            }}>
                                <AlertCircle size={18} /> {assignError}
                            </div>
                        )}

                        {/* ═══ RESULTS PANEL ═══ */}
                        {assignResult && (
                            <div style={{ marginTop: '1.5rem', background: 'rgba(0,0,0,0.25)', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(139,92,246,0.2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <CheckSquare size={20} color="#10b981" />
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#10b981' }}>Assignment Complete</h3>
                                    </div>
                                    <button onClick={() => setAssignResult(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
                                </div>

                                <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{assignResult.message}</p>

                                {/* Fairness Metrics Bar */}
                                <div style={{ display: 'flex', gap: '16px', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
                                    <div style={{ padding: '10px 16px', background: 'rgba(139,92,246,0.1)', borderRadius: '10px', border: '1px solid rgba(139,92,246,0.2)' }}>
                                        <div style={{ fontSize: '0.6rem', color: '#8b5cf6', fontWeight: 'bold', textTransform: 'uppercase' }}>Algorithm</div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '700', fontFamily: 'monospace' }}>{assignResult.fairnessMetrics?.algorithm}</div>
                                    </div>
                                    <div style={{ padding: '10px 16px', background: 'rgba(59,130,246,0.1)', borderRadius: '10px', border: '1px solid rgba(59,130,246,0.2)' }}>
                                        <div style={{ fontSize: '0.6rem', color: '#3b82f6', fontWeight: 'bold', textTransform: 'uppercase' }}>Parcels Assigned</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{assignResult.totalAssigned}</div>
                                    </div>
                                    <div style={{ padding: '10px 16px', background: 'rgba(16,185,129,0.1)', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.2)' }}>
                                        <div style={{ fontSize: '0.6rem', color: '#10b981', fontWeight: 'bold', textTransform: 'uppercase' }}>Fleet Avg Past Load</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{assignResult.fairnessMetrics?.fleetAveragePastLoad}</div>
                                    </div>
                                </div>

                                {/* Driver Fairness Summary Table */}
                                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>DRIVER BURDEN DISTRIBUTION</h4>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 'bold' }}>DRIVER</th>
                                                <th style={{ padding: '8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.7rem' }}>PREV LOAD</th>
                                                <th style={{ padding: '8px', textAlign: 'center', color: '#8b5cf6', fontSize: '0.7rem' }}>+ NEW</th>
                                                <th style={{ padding: '8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.7rem' }}>TOTAL</th>
                                                <th style={{ padding: '8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.7rem' }}>B<sub>i</sub> RATIO</th>
                                                <th style={{ padding: '8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.7rem' }}>FS SCORE</th>
                                                <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.7rem' }}>BURDEN</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {assignResult.driverSummary?.map((d, idx) => {
                                                const maxNew = Math.max(...assignResult.driverSummary.map(x => x.newAssignments));
                                                const barWidth = maxNew > 0 ? (d.newAssignments / maxNew) * 100 : 0;
                                                const burdenColor = d.burdenRatio > 1.2 ? '#ef4444' : d.burdenRatio > 0.8 ? '#f59e0b' : '#10b981';
                                                const burdenLabel = d.burdenRatio > 1.2 ? 'Over-burdened' : d.burdenRatio > 0.8 ? 'Balanced' : 'Under-utilized';
                                                
                                                return (
                                                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <td style={{ padding: '10px 8px' }}>
                                                            <div style={{ fontWeight: '600' }}>{d.name}</div>
                                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{d.email}</div>
                                                        </td>
                                                        <td style={{ padding: '8px', textAlign: 'center', color: 'var(--text-muted)' }}>{d.previousLoad}</td>
                                                        <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', color: '#8b5cf6' }}>+{d.newAssignments}</td>
                                                        <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>{d.totalActive}</td>
                                                        <td style={{ padding: '8px', textAlign: 'center' }}>
                                                            <span style={{ color: burdenColor, fontWeight: 'bold' }}>{d.burdenRatio}</span>
                                                        </td>
                                                        <td style={{ padding: '8px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '0.8rem' }}>{d.fairnessScore}</td>
                                                        <td style={{ padding: '8px', minWidth: '140px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                                                    <div style={{ width: `${barWidth}%`, height: '100%', background: `linear-gradient(90deg, #8b5cf6, #3b82f6)`, borderRadius: '3px', transition: 'width 0.5s ease' }}></div>
                                                                </div>
                                                                <span style={{ fontSize: '0.65rem', color: burdenColor, fontWeight: 'bold', whiteSpace: 'nowrap' }}>{burdenLabel}</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <section className="product-table-section" style={{ marginTop: '2rem' }}>
                    <div className="panel" style={{ background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <h2 style={{ margin: 0 }}>Drivers & Personnel</h2>
                            <button 
                                onClick={() => window.location.href = '/manager/users'}
                                style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--accent)', background: 'transparent', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                            >
                                Manage All Personnel
                            </button>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Name</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Email</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Role</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {drivers.map(driver => (
                                        <tr key={driver._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '1rem', fontWeight: 'bold' }}>{driver.name}</td>
                                            <td style={{ padding: '1rem' }}>{driver.email}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                                                    {driver.role.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {driver.assignedManager === userInfo._id ? (
                                                    <span style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '0.8rem' }}>● In Your Team</span>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Available</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {driver.assignedManager !== userInfo._id && (
                                                    <button 
                                                        onClick={async () => {
                                                            try {
                                                                const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
                                                                await axios.put(`${apiBase}/api/manager/drivers/${driver._id}/recruit`, {}, {
                                                                    headers: { Authorization: `Bearer ${userInfo.token}` }
                                                                });
                                                                window.location.reload();
                                                            } catch (err) {
                                                                alert("Failed to recruit driver");
                                                            }
                                                        }}
                                                        style={{ padding: '0.3rem 0.6rem', borderRadius: '4px', background: 'var(--accent)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                                                    >
                                                        Recruit
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {drivers.length === 0 && (
                                        <tr><td colSpan="5" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No drivers available in your region.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <section className="product-table-section" style={{ marginTop: '2rem' }}>
                    <div className="panel" style={{ background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <h2 style={{ margin: 0 }}>Hub Inventory Details ({selectedHub.toUpperCase()})</h2>
                            <input
                                type="text"
                                placeholder="Search Tracking Code or ID..."
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
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Route Details</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Hub Status</th>
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
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: '500', color: 'var(--text-color)' }}>From: {product.origin || 'Not Configured'}</div>
                                                <div style={{ fontWeight: '500', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Dest: {product.destination}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>To: {product.customerName}</div>
                                                <div style={{ fontSize: '0.82rem', color: 'var(--accent)', marginTop: '0.3rem', fontWeight: '600' }}>
                                                    {product.status === 'Received' ? 'Intra-Region Delivery' : 'Inter-Hub Required'}
                                                </div>
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
                                                    {product.status || 'At Hub'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <button style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--accent-light, #007bff)', background: 'transparent', color: 'var(--accent-light, #007bff)', cursor: 'pointer', fontWeight: 'bold' }}>View Flow</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {products.filter(p => !p.productName && !p.parcelId) /* Fallback filtering */}
                                    {products.filter(p => p.productName?.toLowerCase().includes(searchTerm.toLowerCase()) || (p.parcelId && p.parcelId.toLowerCase().includes(searchTerm.toLowerCase())) || (p.trackingCode && p.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()))).length === 0 && (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No products found matching your search.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <section className="recent-activity" style={{ marginTop: '2rem' }}>
                    <div className="activity-panel">
                        <h2>Hub Logistics Activity</h2>
                        <div className="activity-list">
                            <div className="activity-item">
                                <div className="activity-icon info">📥</div>
                                <div className="activity-details">
                                    <h4>Incoming Inter-Hub Hand-off</h4>
                                    <p>Truck arrived via border hub transfer (e.g. from Salem/Namakkal). 450 parcels entered {selectedHub} hub.</p>
                                </div>
                                <span className="activity-time">5 mins ago</span>
                            </div>
                            <div className="activity-item">
                                <div className="activity-icon success">📤</div>
                                <div className="activity-details">
                                    <h4>Outgoing Inter-Hub Dispatch</h4>
                                    <p>Truck dispatched to Border Hub for inter-region transfer. Next stop depends on target destination.</p>
                                </div>
                                <span className="activity-time">25 mins ago</span>
                            </div>
                            <div className="activity-item">
                                <div className="activity-icon warning">🚚</div>
                                <div className="activity-details">
                                    <h4>Intra-Region Loop Departed</h4>
                                    <p>Truck 05 loaded with 320 parcels bound for local district loops within the {selectedHub} region.</p>
                                </div>
                                <span className="activity-time">1 hr ago</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ManagerDashboard;

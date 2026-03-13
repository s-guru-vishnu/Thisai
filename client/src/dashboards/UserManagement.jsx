import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Users, Truck, Search, ShieldCheck, AlertCircle } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';

const UserManagement = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    console.log("UserManagement: UI Role:", userInfo.role, "Token Present:", !!userInfo.token);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005').replace(/\/$/, '');
            const url = `${apiBase}/api/auth/users`;
            console.log("Fetching users from:", url, "with token:", !!userInfo.token);
            const { data } = await axios.get(url, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            console.log("Fetched users count:", data.length);
            setUsers(data);
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Unknown network error';
            setError(`Failed to fetch users: ${msg}`);
            console.error("Fetch Users Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userInfo.token) {
            fetchUsers();
        } else {
            setError("Authentication token missing. Please log in again.");
            setLoading(false);
        }
    }, []);

    const handleRoleUpdate = async (userId, newRole) => {
        const roleLabel = newRole.replace('_', ' ').toUpperCase();
        if (!window.confirm(`Are you sure you want to promote this user to ${roleLabel}?`)) return;

        try {
            setUpdating(userId);
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            await axios.put(`${apiBase}/api/auth/users/${userId}/role`, { role: newRole }, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            
            // Update local state
            setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update user role');
        } finally {
            setUpdating(null);
        }
    };

    const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">
                <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ background: 'var(--accent)', padding: '12px', borderRadius: '12px', color: 'white' }}>
                            <Users size={28} />
                        </div>
                        <div>
                            <h1>User Management</h1>
                            <p className="subtitle">Delegate and manage roles for your hub personnel.</p>
                        </div>
                    </div>
                </header>

                {error && (
                    <div style={{ 
                        background: 'rgba(255,59,48,0.1)', 
                        padding: '1rem', 
                        borderRadius: '12px', 
                        border: '1px solid var(--danger)', 
                        color: 'var(--danger)',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <AlertCircle size={20} />
                        <p style={{ margin: 0 }}>{error}</p>
                    </div>
                )}

                <div className="panel" style={{ background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Personnel List ({users.length})</h2>
                            {userInfo.email && <p style={{ margin: '5px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Logged in as: {userInfo.email}</p>}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <button 
                                onClick={fetchUsers} 
                                disabled={loading}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'var(--text-main)',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem'
                                }}
                            >
                                {loading ? 'Refreshing...' : 'Refresh List'}
                            </button>
                            <div style={{ position: 'relative', width: '300px' }}>
                                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ 
                                        padding: '0.7rem 1rem 0.7rem 40px', 
                                        width: '100%', 
                                        borderRadius: '10px', 
                                        border: '1px solid var(--border-color)', 
                                        background: 'var(--bg-color)', 
                                        color: 'var(--text-color)' 
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>USER INFO</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>CURRENT ROLE</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>LOCATION</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'right' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" style={{ padding: '0' }}>
                                        <LoadingScreen fullScreen={false} message="Fetching Personnel Data..." />
                                    </td></tr>
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map(user => (
                                        <tr key={user._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ 
                                                        width: '40px', height: '40px', borderRadius: '50%', 
                                                        background: 'var(--bg-primary)', display: 'flex', 
                                                        alignItems: 'center', justifyContent: 'center',
                                                        color: 'var(--accent)', fontWeight: 'bold',
                                                        border: '1px solid var(--border-color)'
                                                    }}>
                                                        {user.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{user.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ 
                                                    padding: '4px 10px', 
                                                    borderRadius: '6px', 
                                                    fontSize: '0.75rem', 
                                                    fontWeight: '700',
                                                    textTransform: 'uppercase',
                                                    background: ['driver', 'cargo_driver', 'delivery_driver'].includes(user.role) ? 'rgba(76,175,80,0.1)' : 'rgba(255,255,255,0.05)',
                                                    color: ['driver', 'cargo_driver', 'delivery_driver'].includes(user.role) ? '#4caf50' : 'var(--text-muted)',
                                                    border: ['driver', 'cargo_driver', 'delivery_driver'].includes(user.role) ? '1px solid rgba(76,175,80,0.2)' : '1px solid rgba(255,255,255,0.1)'
                                                }}>
                                                    {user.role.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontSize: '0.9rem' }}>{user.location?.city || 'N/A'}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.region || '--'}</div>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                {!['driver', 'cargo_driver', 'delivery_driver'].includes(user.role) ? (
                                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                        {(userInfo.role === 'admin' || (userInfo.role === 'manager' && user.role === 'customer')) ? (
                                                            <>
                                                                {userInfo.role === 'admin' && (
                                                                    <button 
                                                                        onClick={() => handleRoleUpdate(user._id, 'cargo_driver')}
                                                                        disabled={updating === user._id}
                                                                        style={{ 
                                                                            padding: '8px 12px', 
                                                                            borderRadius: '8px', 
                                                                            border: 'none', 
                                                                            background: '#2196f3', 
                                                                            color: 'white',
                                                                            fontWeight: '600',
                                                                            fontSize: '0.75rem',
                                                                            cursor: 'pointer',
                                                                            display: 'inline-flex',
                                                                            alignItems: 'center',
                                                                            gap: '6px',
                                                                            boxShadow: '0 4px 12px rgba(33,150,243,0.2)'
                                                                        }}
                                                                        title="Inter-region hub-to-hub driver"
                                                                    >
                                                                        <Truck size={14} />
                                                                        Cargo
                                                                    </button>
                                                                )}
                                                                <button 
                                                                    onClick={() => handleRoleUpdate(user._id, 'delivery_driver')}
                                                                    disabled={updating === user._id}
                                                                    style={{ 
                                                                        padding: '8px 12px', 
                                                                        borderRadius: '8px', 
                                                                        border: 'none', 
                                                                        background: 'var(--accent)', 
                                                                        color: 'white',
                                                                        fontWeight: '600',
                                                                        fontSize: '0.75rem',
                                                                        cursor: 'pointer',
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        gap: '6px',
                                                                        boxShadow: '0 4px 12px rgba(255,107,0,0.2)'
                                                                    }}
                                                                    title="Last-mile warehouse-to-customer driver"
                                                                >
                                                                    <Truck size={14} />
                                                                    Delivery
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Fixed Role</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                        <div style={{ color: '#4caf50', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600' }}>
                                                            <ShieldCheck size={16} /> {user.role.replace('_', ' ').toUpperCase()}
                                                        </div>
                                                        {(userInfo.role === 'admin' || (userInfo.role === 'manager' && user.role !== 'cargo_driver')) && (
                                                            <button 
                                                                onClick={() => handleRoleUpdate(user._id, 'customer')}
                                                                disabled={updating === user._id}
                                                                style={{ 
                                                                    padding: '4px 10px', 
                                                                    borderRadius: '6px', 
                                                                    border: '1px solid var(--border-color)', 
                                                                    background: 'transparent', 
                                                                    color: 'var(--text-muted)',
                                                                    fontSize: '0.7rem',
                                                                    cursor: 'pointer',
                                                                    fontWeight: '600'
                                                                }}
                                                                title="Revoke Driver Role"
                                                            >
                                                                Revoke
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No users found matching your search.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <style>{`
                tr:hover { background: rgba(255,255,255,0.02); }
                .primary-btn:disabled { opacity: 0.6; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default UserManagement;

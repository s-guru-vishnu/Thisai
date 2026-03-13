import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import { UserPlus, Search, Filter, X, Shield, Mail, Calendar, Key, User, Trash2 } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import axios from 'axios';

const UsersPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            // Getting token if needed
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo?.token}` }
            };
            const { data } = await axios.get(`${apiBase}/api/admin/users`, config);
            setUsers(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
                              (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRole = roleFilter === 'All' || (user.role && user.role.toLowerCase() === roleFilter.toLowerCase());
        return matchesSearch && matchesRole;
    });

    const handleAddUser = () => {
        setCurrentUser(null);
        setIsModalOpen(true);
    };

    const handleEditUser = (user) => {
        setCurrentUser(user);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (user) => {
        setCurrentUser(user);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo?.token}` }
            };
            await axios.delete(`${apiBase}/api/admin/users/${currentUser._id}`, config);
            setUsers(users.filter(u => u._id !== currentUser._id));
            setIsDeleteModalOpen(false);
            setCurrentUser(null);
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user.');
        }
    };

    const handleSuspendUser = async (user) => {
        // Just local state simulation for now as there's no suspend API yet
        setUsers(users.map(u => 
            u._id === user._id ? { ...u, role: u.role === 'suspended' ? 'customer' : 'suspended' } : u
        ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            role: formData.get('role').toLowerCase(),
            password: 'password123'
        };

        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo?.token}` }
            };

            if (currentUser) {
                // Future implementation: Update user API
                alert('Update not implemented on backend yet.');
                setIsModalOpen(false);
            } else {
                const { data } = await axios.post(`${apiBase}/api/auth/register`, userData);
                fetchUsers(); // Refresh list
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error('Error saving user:', error);
            alert(error.response?.data?.message || 'Error occurred.');
        }
    };

    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">
                <header className="dashboard-header">
                    <div>
                        <h1>User <span>Management</span></h1>
                        <p className="subtitle">Maintain system access and role assignments.</p>
                    </div>
                    <button style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleAddUser}>
                        <UserPlus size={18} /> Add New User
                    </button>
                </header>

                <div className="table-controls" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
                    <div className="search-box" style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                            type="text" 
                            placeholder="Search by name or email..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '14px 14px 14px 45px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-panel)', color: 'white', fontSize: '1rem' }}
                        />
                    </div>
                    <div style={{ position: 'relative', height: '100%' }}>
                        <Filter size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        <select 
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="secondary-btn"
                            style={{ margin: 0, padding: '14px 20px 14px 45px', width: 'auto', height: '100%', appearance: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem' }}
                        >
                            <option value="All">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="warehouse">Warehouse</option>
                            <option value="driver">Driver</option>
                            <option value="customer">Customer</option>
                            <option value="parcel_receiver">Receiver</option>
                            <option value="seller">Seller</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <LoadingScreen fullScreen={false} message="Parsing User Database..." />
                ) : (
                    <DataTable 
                        headers={['Full Name', 'Email Address', 'Role', 'Joined Date']}
                        data={filteredUsers.map(user => {
                            let formattedRole = 'Unknown';
                            if (user.role) {
                                if (user.role.toLowerCase() === 'parcel_receiver') {
                                    formattedRole = 'Receiver';
                                } else {
                                    formattedRole = user.role.charAt(0).toUpperCase() + user.role.slice(1);
                                }
                            }
                            return {
                                name: user.name,
                                email: user.email,
                                role: formattedRole,
                                joined: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : 'N/A'
                            };
                        })}
                        onEdit={(row) => handleEditUser(users.find(u => u.email === row.email))}
                        onSuspend={(row) => handleSuspendUser(users.find(u => u.email === row.email))}
                        onDelete={(row) => handleDeleteClick(users.find(u => u.email === row.email))}
                    />
                )}
            </main>

            {/* User Form Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>
                            <X size={20} />
                        </button>
                        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <UserPlus className="text-accent" /> {currentUser ? 'Update User' : 'Create User'}
                        </h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div className="form-group">
                                <label><User size={14} /> Full Name</label>
                                <input name="name" type="text" defaultValue={currentUser?.name} placeholder="e.g. Emily Watson" required />
                            </div>
                            <div className="form-group">
                                <label><Mail size={14} /> Email Address</label>
                                <input name="email" type="email" defaultValue={currentUser?.email} placeholder="e.g. emily@impact.com" required />
                            </div>
                            <div className="form-group">
                                <label><Shield size={14} /> Assign Role</label>
                                <select 
                                    name="role" 
                                    defaultValue={currentUser?.role ? (currentUser.role.toLowerCase() === 'parcel_receiver' ? 'Receiver' : currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)) : 'Driver'} 
                                    style={{ 
                                        padding: '14px', 
                                        borderRadius: '10px', 
                                        border: '1px solid var(--border-color)', 
                                        background: 'var(--bg-panel)', 
                                        color: 'white',
                                        fontSize: '1rem',
                                        appearance: 'none',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="manager">Manager</option>
                                    <option value="warehouse">Warehouse</option>
                                    <option value="driver">Driver</option>
                                    <option value="customer">Customer</option>
                                    <option value="parcel_receiver">Receiver</option>
                                    <option value="seller">Seller</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="submit" style={{ padding: '14px', flex: 1, background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>{currentUser ? 'Save Changes' : 'Generate Account'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,59,48,0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                            <Trash2 size={30} />
                        </div>
                        <h2 style={{ marginBottom: '0.5rem' }}>Delete User?</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            You are about to delete <strong>{currentUser?.name}</strong>. This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="secondary-btn" style={{ margin: 0, padding: '14px', flex: 1 }} onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                            <button className="primary-btn" style={{ margin: 0, padding: '14px', flex: 1, background: 'var(--danger)' }} onClick={confirmDelete}>Confirm Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;

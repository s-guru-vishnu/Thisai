import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import { UserPlus, Search, Filter, X, Shield, Mail, Calendar, Key, User } from 'lucide-react';

const UsersPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([
        { id: 1, name: 'Guru Vishnu', email: 'admin@impact.com', role: 'Admin', joined: '2026-03-01', status: 'Active' },
        { id: 2, name: 'John Doe', email: 'manager@impact.com', role: 'Manager', joined: '2026-03-05', status: 'Active' },
        { id: 3, name: 'Sarah Wilson', email: 'warehouse@impact.com', role: 'Warehouse', joined: '2026-03-08', status: 'Active' },
        { id: 4, name: 'Mike Ross', email: 'driver@impact.com', role: 'Driver', joined: '2026-03-09', status: 'Active' }
    ]);

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    const confirmDelete = () => {
        setUsers(users.filter(u => u.id !== currentUser.id));
        setIsDeleteModalOpen(false);
        setCurrentUser(null);
    };

    const handleSuspendUser = (user) => {
        setUsers(users.map(u => 
            u.id === user.id ? { ...u, role: u.role === 'Suspended' ? 'Manager' : 'Suspended' } : u
        ));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const userData = {
            id: currentUser ? currentUser.id : Date.now(),
            name: formData.get('name'),
            email: formData.get('email'),
            role: formData.get('role'),
            joined: currentUser ? currentUser.joined : new Date().toISOString().split('T')[0],
            status: 'Active'
        };

        if (currentUser) {
            setUsers(users.map(u => u.id === currentUser.id ? userData : u));
        } else {
            setUsers([...users, userData]);
        }
        setIsModalOpen(false);
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
                    <button className="primary-btn pulse-glow flex items-center gap-2" onClick={handleAddUser}>
                        <UserPlus size={18} /> Add New User
                    </button>
                </header>

                <div className="table-controls" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="search-box" style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                        <input 
                            type="text" 
                            placeholder="Search by name or email..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-panel)', color: 'white' }}
                        />
                    </div>
                    <button className="secondary-btn flex items-center gap-2" style={{ width: 'auto' }}>
                        <Filter size={18} /> All Roles
                    </button>
                </div>

                <DataTable 
                    headers={['Full Name', 'Email Address', 'Role', 'Joined Date']}
                    data={filteredUsers.map(user => ({
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        joined: user.joined
                    }))}
                    onEdit={(row) => handleEditUser(users.find(u => u.email === row.email))}
                    onSuspend={(row) => handleSuspendUser(users.find(u => u.email === row.email))}
                    onDelete={(row) => handleDeleteClick(users.find(u => u.email === row.email))}
                />
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
                                <select name="role" defaultValue={currentUser?.role || 'Manager'} style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.5)', color: 'white' }}>
                                    <option>Admin</option>
                                    <option>Manager</option>
                                    <option>Warehouse</option>
                                    <option>Driver</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="secondary-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="primary-btn flex-grow">{currentUser ? 'Save Changes' : 'Generate Account'}</button>
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
                            <button className="secondary-btn flex-grow" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                            <button className="primary-btn flex-grow" style={{ background: 'var(--danger)' }} onClick={confirmDelete}>Confirm Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;

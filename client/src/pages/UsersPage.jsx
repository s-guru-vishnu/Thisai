import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import { UserPlus, Search, Filter, X, Shield, Mail, Calendar, Key, User } from 'lucide-react';

const UsersPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const users = [
        { name: 'Guru Vishnu', email: 'admin@impact.com', role: 'Admin', joined: '2026-03-01' },
        { name: 'John Doe', email: 'manager@impact.com', role: 'Manager', joined: '2026-03-05' },
        { name: 'Sarah Wilson', email: 'warehouse@impact.com', role: 'Warehouse', joined: '2026-03-08' },
        { name: 'Mike Ross', email: 'driver@impact.com', role: 'Driver', joined: '2026-03-09' }
    ];

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">
                <header className="dashboard-header">
                    <div>
                        <h1>User <span>Management</span></h1>
                        <p className="subtitle">Maintain system access and role assignments.</p>
                    </div>
                    <button className="primary-btn pulse-glow flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
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
                        <Filter size={18} /> Filter Roles
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
                    actions={true}
                />
            </main>

            {/* Simple Modal Implementation */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>
                            <X size={20} />
                        </button>
                        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <UserPlus className="text-accent" /> Create User
                        </h2>
                        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div className="form-group">
                                <label><User size={14} /> Full Name</label>
                                <input type="text" placeholder="e.g. Emily Watson" required />
                            </div>
                            <div className="form-group">
                                <label><Mail size={14} /> Email Address</label>
                                <input type="email" placeholder="e.g. emily@impact.com" required />
                            </div>
                            <div className="form-group">
                                <label><Shield size={14} /> Assign Role</label>
                                <select style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.5)', color: 'white' }}>
                                    <option>Admin</option>
                                    <option>Manager</option>
                                    <option>Warehouse</option>
                                    <option>Driver</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label><Key size={14} /> Default Password</label>
                                <input type="password" value="password123" readOnly style={{ opacity: 0.6 }} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="secondary-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="primary-btn flex-grow">Generate Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;

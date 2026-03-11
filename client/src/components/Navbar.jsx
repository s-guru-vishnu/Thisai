import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Users, Map, Package, Truck, BrainCircuit, User, LogOut, Menu, X, Bell } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    // Get user info from localStorage to determine role
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isAdmin = userInfo.role === 'admin';
    const isSeller = userInfo.role === 'seller';
    const isCustomer = userInfo.role === 'customer';
    const isReceiver = userInfo.role === 'parcel_receiver';
    const isManager = userInfo.role === 'manager';

    const firstLetter = userInfo.name ? userInfo.name.charAt(0).toUpperCase() : '?';

    const [notifications, setNotifications] = useState([]);

    const fetchNotifications = async () => {
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo?.token}`
                }
            };
            
            let url = `${apiBase}/api/admin/notifications`;
            if (isCustomer) {
                url = `${apiBase}/api/parcel/notifications`;
            }
            
            const { data } = await axios.get(url, config);
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        if (userInfo?.token) {
            fetchNotifications();
            // Optional: poll every 1 minute
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [userInfo?.token]);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} />, show: isAdmin || (!userInfo.role && !isManager) },
        { name: 'Dashboard', path: '/manager', icon: <LayoutDashboard size={18} />, show: isManager },
        { name: 'Users', path: '/dashboard/users', icon: <Users size={18} />, show: isAdmin },
        { name: 'Live Map', path: '/dashboard/map', icon: <Map size={18} />, show: isAdmin },
        { name: 'Parcels', path: '/dashboard/parcels', icon: <Package size={18} />, show: isAdmin || isReceiver },
        { name: 'Drivers', path: '/dashboard/drivers', icon: <Truck size={18} />, show: isAdmin },
        { name: 'AI Predictions', path: '/dashboard/predictions', icon: <BrainCircuit size={18} />, show: isAdmin },
        // Seller specific
        { name: 'My Deliveries', path: '/seller/deliveries', icon: <Package size={18} />, show: isSeller },

        // Receiver specific
        { name: 'Scan QR', path: '/receiver/scan', icon: <LayoutDashboard size={18} />, show: isReceiver },
        { name: 'Manual Entry', path: '/receiver/manual', icon: <LayoutDashboard size={18} />, show: isReceiver },

        // Manager specific
        { name: 'Parcels', path: '/manager', icon: <Package size={18} />, show: isManager },
        { name: 'Scan QR', path: '/manager/scan', icon: <LayoutDashboard size={18} />, show: isManager },
        { name: 'Manual Entry', path: '/manager/manual', icon: <LayoutDashboard size={18} />, show: isManager },

        // Customer specific
        { name: 'Dashboard', path: '/customer', icon: <LayoutDashboard size={18} />, show: isCustomer },
        { name: 'Track', path: '/customer/track', icon: <Map size={18} />, show: isCustomer },
        { name: 'History', path: '/customer/history', icon: <Package size={18} />, show: isCustomer },
    ];

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <img src="/Thisai.png" alt="Thisai Logo" className="logo-orb" />
                <span className="brand-name">THISAI</span>
            </div>

            <div className={`nav-menu-container ${isMenuOpen ? 'open' : ''}`}>
                <ul className="nav-links">
                    {navItems.filter(item => item.show).map((item) => (
                        <li key={item.path} className={location.pathname === item.path ? 'active' : ''}>
                            <Link to={item.path} onClick={() => setIsMenuOpen(false)}>
                                {item.icon}
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="nav-profile">
                <div className="notifications-wrapper" style={{ position: 'relative' }}>
                    <div
                        className="notifications"
                        onClick={() => {
                            setIsNotificationsOpen(!isNotificationsOpen);
                            setIsProfileOpen(false);
                        }}
                        style={{ cursor: 'pointer', color: isNotificationsOpen ? 'var(--accent)' : 'var(--text-muted)' }}
                    >
                        <Bell size={20} />
                        {notifications.length > 0 && <span className="indicator"></span>}
                    </div>

                    {isNotificationsOpen && (
                        <div className="notifications-dropdown" style={{
                            position: 'absolute',
                            top: '120%',
                            right: '-10px',
                            background: 'var(--bg-panel)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '14px',
                            minWidth: '320px',
                            padding: '1rem',
                            boxShadow: '0 15px 40px rgba(0,0,0,0.6)',
                            zIndex: 100,
                            animation: 'popIn 0.2s ease'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                                <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Notifications</h4>
                                <span style={{ fontSize: '0.75rem', color: 'var(--accent)', cursor: 'pointer' }}>Mark all read</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '300px', overflowY: 'auto' }}>
                                {notifications.length > 0 ? (
                                    notifications.map(n => (
                                        <div key={n.id} style={{ display: 'flex', gap: '12px', padding: '0.8rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.type === 'warning' ? 'var(--warning)' : n.type === 'success' ? 'var(--success)' : 'var(--info)', marginTop: '5px' }}></div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '600', color: 'white' }}>{n.title}</p>
                                                <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{n.message}</p>
                                                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '5px', display: 'block' }}>{n.time}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem' }}>No new notifications</p>
                                )}
                            </div>
                            <button className="secondary-btn" style={{ marginTop: '1rem', width: '100%', fontSize: '0.85rem', padding: '8px' }}>View All Alerts</button>
                        </div>
                    )}
                </div>

                <div className="avatar-wrapper" style={{ position: 'relative' }}>
                    <div
                        className="avatar"
                        onClick={() => {
                            setIsProfileOpen(!isProfileOpen);
                            setIsNotificationsOpen(false);
                        }}
                        style={{
                            cursor: 'pointer',
                            border: isProfileOpen ? '2px solid var(--accent)' : '2px solid var(--border-color)',
                            transition: 'all 0.2s',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'var(--bg-primary)',
                            fontWeight: '700',
                            color: 'var(--accent)',
                            fontSize: '0.9rem',
                            boxShadow: isProfileOpen ? '0 0 12px var(--accent-glow)' : 'none'
                        }}
                    >
                        {firstLetter}
                    </div>

                    {isProfileOpen && (
                        <div className="profile-dropdown" style={{
                            position: 'absolute',
                            top: '120%',
                            right: 0,
                            background: 'var(--bg-panel)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            minWidth: '200px',
                            padding: '0.5rem',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            zIndex: 100,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.25rem'
                        }}>
                            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
                                <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--text-main)', fontSize: '0.95rem' }}>{userInfo.name || 'User'}</p>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'capitalize' }}>{userInfo.role || 'Guest'}</p>
                            </div>
<<<<<<< HEAD
                            
                            <Link to="/settings/basic-info" onClick={() => setIsProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', color: 'var(--text-color)', textDecoration: 'none', borderRadius: '8px', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
=======

                            <Link to="/dashboard/profile" onClick={() => setIsProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', color: 'var(--text-color)', textDecoration: 'none', borderRadius: '8px', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
>>>>>>> 325c4039c10287285b4dcd647c557890aca4518f
                                <User size={16} />
                                <span>Profile</span>
                            </Link>

                            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', color: 'var(--danger)', background: 'transparent', border: 'none', width: '100%', textAlign: 'left', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,59,48,0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                                <LogOut size={16} />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    )}
                </div>
                <button className="mobile-menu-toggle" onClick={toggleMenu}>
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;

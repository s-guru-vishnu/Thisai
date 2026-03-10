import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Map, Package, Truck, BrainCircuit, Settings, LogOut, Menu, X, Bell } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Get user info from localStorage to determine role
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isAdmin = userInfo.role === 'admin';
    const isSeller = userInfo.role === 'seller';
    const isCustomer = userInfo.role === 'customer';
    const isReceiver = userInfo.role === 'parcel_receiver';

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} />, show: isAdmin || !userInfo.role },
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
    ];

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <div className="logo-orb"></div>
                <span className="brand-name">IMPACT<span className="brand-accent">LOGISTICS</span></span>
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
                    {isAdmin && (
                        <li className={location.pathname === '/dashboard/settings' ? 'active' : ''}>
                            <Link to="/dashboard/settings" onClick={() => setIsMenuOpen(false)}>
                                <Settings size={18} />
                                Settings
                            </Link>
                        </li>
                    )}
                </ul>
            </div>

            <div className="nav-profile">
                <div className="notifications">
                    <Bell size={20} />
                    <span className="indicator"></span>
                </div>
                <div className="avatar">
                    <img src={`https://ui-avatars.com/api/?name=${userInfo.name || 'User'}&background=FF6B00&color=fff&rounded=true`} alt="User avatar" />
                </div>
                <button onClick={handleLogout} className="logout-btn" title="Logout">
                    <LogOut size={18} />
                </button>
                <button className="mobile-menu-toggle" onClick={toggleMenu}>
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;

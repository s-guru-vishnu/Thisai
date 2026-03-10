import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isSeller = location.pathname.startsWith('/seller');
    const isCustomer = location.pathname.startsWith('/customer');
    const isReceiver = location.pathname.startsWith('/receiver');

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <div className="logo-orb"></div>
                <span className="brand-name">IMPACT<span className="brand-accent">LOGISTICS</span></span>
            </div>

            <ul className="nav-links">
                {isSeller && (
                    <>
                        <li className={location.pathname === '/seller' ? 'active' : ''}>
                            <Link to="/seller" style={{ textDecoration: 'none', color: 'inherit' }}>Dashboard</Link>
                        </li>
                        <li className={location.pathname.includes('/seller/deliveries') ? 'active' : ''}>
                            <Link to="/seller/deliveries" style={{ textDecoration: 'none', color: 'inherit' }}>Manage Deliveries</Link>
                        </li>
                    </>
                )}
                {isCustomer && (
                    <>
                        <li className={location.pathname === '/customer' ? 'active' : ''}>
                            <Link to="/customer" style={{ textDecoration: 'none', color: 'inherit' }}>Track Shipment</Link>
                        </li>
                    </>
                )}
                {isReceiver && (
                    <>
                        <li className={location.pathname === '/receiver' ? 'active' : ''}>
                            <Link to="/receiver" style={{ textDecoration: 'none', color: 'inherit' }}>Receiver Hub</Link>
                        </li>
                    </>
                )}
                {!isSeller && !isCustomer && !isReceiver && (
                    <>
                        <li className="active"><a href="#dashboard">Dashboard</a></li>
                        <li><a href="#map">Live Map</a></li>
                    </>
                )}
            </ul>

            <div className="nav-profile">
                <div className="notifications">
                    <span className="indicator"></span>
                    🔔
                </div>
                <div className="avatar">
                    <img src="https://ui-avatars.com/api/?name=User&background=FF6600&color=fff&rounded=true" alt="User avatar" />
                </div>
                <button onClick={handleLogout} className="logout-btn">
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;

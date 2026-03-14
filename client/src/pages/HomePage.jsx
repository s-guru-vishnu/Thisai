import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import {
    Search, QrCode, Map, Clock, Truck, Warehouse, Route, ShoppingBag, Globe, Radio,
    Brain, CloudRain, Users, Shield, ChevronDown, Menu, X,
    Linkedin, Twitter, Instagram, Package, Store, CheckCircle
} from 'lucide-react';
import '../styles/homepage.css';

const HomePage = () => {
    const navigate = useNavigate();
    const [trackingInput, setTrackingInput] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleTrack = () => {
        const code = trackingInput.trim().toUpperCase();
        if (code.length === 10) {
            navigate(`/customer/track?id=${code}`);
        }
    };

    const getDashboardRoute = () => {
        if (!userInfo) return '/login';
        const role = userInfo.role;
        if (role === 'admin') return '/dashboard';
        if (role === 'manager') return '/manager';
        if (role === 'driver') return '/driver';
        if (role === 'customer') return '/customer';
        if (role === 'seller') return '/seller';
        return '/login';
    };

    // ─── SERVICES DATA ───
    const services = [
        { icon: <Truck size={24} />, title: 'Last Mile Delivery', desc: 'Fast and reliable delivery to your customer\'s doorstep with real-time tracking.' },
        { icon: <Warehouse size={24} />, title: 'Warehouse Management', desc: 'Intelligent warehouse operations with automated inventory and dispatch.' },
        { icon: <Route size={24} />, title: 'AI Route Optimization', desc: 'Machine learning algorithms that find the fastest, most cost-effective routes.' },
        { icon: <ShoppingBag size={24} />, title: 'Marketplace Fulfillment', desc: 'Seamless integration with major e-commerce platforms for auto-fulfillment.' },
        { icon: <Globe size={24} />, title: 'Cross Border Logistics', desc: 'International shipping with customs clearance and end-to-end tracking.' },
        { icon: <Radio size={24} />, title: 'Real Time Tracking', desc: 'Live GPS tracking with ETA predictions and delivery status updates.' },
    ];

    // ─── AI FEATURES DATA ───
    const aiFeatures = [
        { icon: <Brain size={22} />, title: 'Traffic Prediction', desc: 'AI analyzes traffic patterns to predict delays before they happen.' },
        { icon: <CloudRain size={22} />, title: 'Weather Risk Detection', desc: 'Real-time weather data integration for proactive route adjustments.' },
        { icon: <Users size={22} />, title: 'Driver Workload Balancing', desc: 'Fair distribution of deliveries based on capacity and availability.' },
        { icon: <Shield size={22} />, title: 'Fairness Routing', desc: 'Ethical AI ensuring equitable delivery distribution across regions.' },
    ];

    // ─── HOW IT WORKS DATA ───
    const steps = [
        { title: 'Create Shipment', desc: 'Enter pickup & drop details' },
        { title: 'AI Predicts Delays', desc: 'Engine analyzes risks' },
        { title: 'Assign Driver', desc: 'Best match selected' },
        { title: 'Track Live', desc: 'Real-time GPS updates' },
        { title: 'Delivered', desc: 'Customer confirms receipt' },
    ];

    // ─── TESTIMONIALS DATA ───
    const testimonials = [
        { quote: '"This platform improved our delivery efficiency by 30%. The AI predictions are incredibly accurate."', name: 'Priya Sharma', role: 'Seller', initial: 'P' },
        { quote: '"Managing warehouses has never been easier. The dashboard gives me complete visibility."', name: 'Arjun Menon', role: 'Logistics Manager', initial: 'A' },
        { quote: '"I love the real-time tracking. I always know exactly when my package will arrive."', name: 'Divya Kumar', role: 'Customer', initial: 'D' },
    ];

    // ─── FAQ DATA ───
    const faqs = [
        { q: 'How do I track my order?', a: 'Enter your 10-digit tracking code in the Track Shipment section above or navigate to the Track page from the navbar. You\'ll see real-time updates including live GPS location.' },
        { q: 'How does AI delay prediction work?', a: 'Our AI engine analyzes historical data, real-time traffic, weather conditions, and driver availability to predict potential delays before they happen, allowing proactive route adjustments.' },
        { q: 'How do I connect my Amazon store?', a: 'Navigate to Settings → Platforms after logging in. Click "Connect Marketplace" and follow the authorization flow for Amazon or any other supported platform.' },
        { q: 'How can drivers register?', a: 'Click "Apply as Driver" from the homepage or register on the sign-up page selecting "Driver" as your role. You\'ll need to provide your license and vehicle details.' },
    ];

    // ─── ANIMATED COUNTER ───
    const AnimatedStat = ({ value, suffix = '', label }) => {
        const [count, setCount] = useState(0);
        const ref = useRef(null);

        useEffect(() => {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        let start = 0;
                        const end = parseInt(value);
                        const duration = 2000;
                        const step = Math.max(1, Math.floor(end / (duration / 16)));
                        const timer = setInterval(() => {
                            start += step;
                            if (start >= end) { start = end; clearInterval(timer); }
                            setCount(start);
                        }, 16);
                        observer.disconnect();
                    }
                },
                { threshold: 0.3 }
            );
            if (ref.current) observer.observe(ref.current);
            return () => observer.disconnect();
        }, [value]);

        return (
            <div className="stat-item" ref={ref}>
                <p className="stat-value">{count.toLocaleString()}{suffix}</p>
                <p className="stat-label">{label}</p>
            </div>
        );
    };

    // ─── RENDER ───
    return (
        <div style={{ background: '#0B0B0C', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

            {/* ══════ NAVBAR ══════ */}
            <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
                <a href="#" className="nav-logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                    <span>THIS<span className="accent">AI</span></span>
                </a>

                <ul className="landing-nav-links">
                    <li><a href="#hero">Home</a></li>
                    <li><a href="#track">Track</a></li>
                    <li><a href="#services">Services</a></li>
                    <li><a href="#join">Drivers</a></li>
                    <li><a href="#ai">AI Predictions</a></li>
                    <li><a href="#faq">Contact</a></li>
                </ul>

                <div className="landing-nav-actions">
                    {userInfo ? (
                        <button className="btn-accent" onClick={() => navigate(getDashboardRoute())}>Dashboard</button>
                    ) : (
                        <>
                            <button className="btn-ghost" onClick={() => navigate('/login')}>Login</button>
                            <button className="btn-accent" onClick={() => navigate('/register')}>Sign Up</button>
                        </>
                    )}
                </div>

                <button className="landing-mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)}>
                    {mobileMenu ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            {/* Mobile overlay */}
            {mobileMenu && (
                <div style={{
                    position: 'fixed', top: 64, left: 0, width: '100%', background: '#111', zIndex: 999,
                    padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem',
                    borderBottom: '1px solid #2A2A2A'
                }}>
                    {['Home', 'Track', 'Services', 'Drivers', 'AI Predictions', 'Contact'].map(l => (
                        <a key={l} href={`#${l.toLowerCase().replace(' ', '-')}`} style={{ color: '#A3A3A3', textDecoration: 'none', fontSize: '1rem' }}
                            onClick={() => setMobileMenu(false)}>{l}</a>
                    ))}
                    {!userInfo && (
                        <button className="btn-accent" style={{ marginTop: '0.5rem' }} onClick={() => navigate('/login')}>Login</button>
                    )}
                </div>
            )}

            {/* ══════ HERO ══════ */}
            <section className="hero-section" id="hero">
                <div className="hero-left">
                    <h1><span className="accent">AI-Powered</span> Smart Logistics Platform</h1>
                    <p>Predict delays, optimize delivery routes, and track shipments in real time with India's most intelligent logistics engine.</p>
                    <div className="hero-btns">
                        <button className="btn-accent btn-accent-lg" onClick={() => document.getElementById('track').scrollIntoView({ behavior: 'smooth' })}>
                            Track Shipment
                        </button>
                        <button className="btn-ghost btn-accent-lg" onClick={() => userInfo ? navigate(getDashboardRoute()) : navigate('/register')}>
                            Create Delivery
                        </button>
                    </div>
                </div>
                <div className="hero-right">
                    <div className="hero-lottie">
                        <DotLottieReact
                            src="https://lottie.host/9c29f6be-f995-41a6-99bd-f82da8317d5a/78XaStnHV9.lottie"
                            loop
                            autoplay
                        />
                    </div>
                </div>
            </section>

            {/* ══════ TRACK SHIPMENT ══════ */}
            <section className="hp-section-alt" id="track">
                <div className="hp-section track-section">
                    <h2 className="hp-section-title">Track Your <span className="accent">Shipment</span></h2>
                    <p className="hp-section-subtitle">Enter your 10-digit tracking code to get real-time updates on your package.</p>

                    <div className="track-box">
                        <input
                            type="text"
                            placeholder="Enter 10-digit Tracking Code"
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value.toUpperCase())}
                            maxLength={10}
                            onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                        />
                        <button className="btn-accent" onClick={handleTrack}>Track</button>
                    </div>

                    <div className="track-features">
                        <div className="track-feature">
                            <div className="track-feature-icon"><QrCode size={20} /></div>
                            QR Code Scanner
                        </div>
                        <div className="track-feature">
                            <div className="track-feature-icon"><Map size={20} /></div>
                            Live Map Tracking
                        </div>
                        <div className="track-feature">
                            <div className="track-feature-icon"><Clock size={20} /></div>
                            ETA Prediction
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════ SERVICES ══════ */}
            <section className="hp-section-dark" id="services">
                <div className="hp-section">
                    <h2 className="hp-section-title">Our <span className="accent">Services</span></h2>
                    <p className="hp-section-subtitle">End-to-end logistics solutions powered by artificial intelligence.</p>
                    <div className="services-grid">
                        {services.map((s, i) => (
                            <div className="service-card" key={i}>
                                <div className="service-icon">{s.icon}</div>
                                <h3>{s.title}</h3>
                                <p>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════ AI FEATURES ══════ */}
            <section className="hp-section-alt" id="ai">
                <div className="hp-section">
                    <h2 className="hp-section-title">AI Delay <span className="accent">Prediction Engine</span></h2>
                    <p className="hp-section-subtitle">Our hackathon-winning AI engine predicts and prevents delivery delays before they happen.</p>
                    <div className="ai-grid">
                        {aiFeatures.map((f, i) => (
                            <div className="ai-card" key={i}>
                                <div className="ai-card-icon">{f.icon}</div>
                                <h4>{f.title}</h4>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════ MARKETPLACE INTEGRATION ══════ */}
            <section className="hp-section-dark" id="marketplace">
                <div className="hp-section">
                    <h2 className="hp-section-title">Marketplace <span className="accent">Integration</span></h2>
                    <p className="hp-section-subtitle">Connect your e-commerce platforms and automate logistics in minutes.</p>
                    <div className="mp-content">
                        <div className="mp-logos">
                            {['Amazon', 'Flipkart', 'Shopify', 'WooCommerce', 'Meesho'].map(p => (
                                <div className="mp-logo" key={p}>{p}</div>
                            ))}
                        </div>
                        <div className="mp-info">
                            <h3>Automate Your Fulfillment</h3>
                            <ul className="mp-features">
                                <li>Auto order sync from all platforms</li>
                                <li>One-click shipment creation</li>
                                <li>Real-time tracking updates</li>
                                <li>Delivery analytics dashboard</li>
                            </ul>
                            <button className="btn-accent btn-accent-lg" onClick={() => navigate(userInfo ? '/settings' : '/register')}>
                                Connect Marketplace
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════ HOW IT WORKS ══════ */}
            <section className="hp-section-alt" id="how">
                <div className="hp-section">
                    <h2 className="hp-section-title">How It <span className="accent">Works</span></h2>
                    <p className="hp-section-subtitle">From shipment creation to delivery — powered by AI at every step.</p>
                    <div className="steps-timeline">
                        {steps.map((s, i) => (
                            <div className="step-item" key={i}>
                                <div className="step-number">{i + 1}</div>
                                <h4>{s.title}</h4>
                                <p>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════ DRIVER / SELLER JOIN ══════ */}
            <section className="hp-section-dark" id="join">
                <div className="hp-section">
                    <h2 className="hp-section-title">Join the <span className="accent">Network</span></h2>
                    <p className="hp-section-subtitle">Whether you deliver or sell — THISAI has a place for you.</p>
                    <div className="join-grid">
                        <div className="join-card">
                            <div className="join-card-icon"><Truck size={28} /></div>
                            <h3>Become a Delivery Driver</h3>
                            <p>Earn by delivering packages on your schedule. Flexible hours, competitive pay, and AI-optimized routes.</p>
                            <button className="btn-accent" onClick={() => navigate('/register')}>Apply as Driver</button>
                        </div>
                        <div className="join-card">
                            <div className="join-card-icon"><Store size={28} /></div>
                            <h3>Connect Your Online Store</h3>
                            <p>Automate your logistics, sync orders from marketplaces, and let AI handle fulfillment.</p>
                            <button className="btn-accent" onClick={() => navigate('/register')}>Register as Seller</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════ STATS ══════ */}
            <section className="hp-section-alt" id="stats">
                <div className="hp-section">
                    <div className="stats-grid">
                        <AnimatedStat value="12400" suffix="+" label="Packages Delivered Today" />
                        <AnimatedStat value="850" suffix="+" label="Active Drivers" />
                        <AnimatedStat value="120" label="Warehouses Connected" />
                        <AnimatedStat value="97" suffix="%" label="On-Time Delivery Rate" />
                    </div>
                </div>
            </section>

            {/* ══════ TESTIMONIALS ══════ */}
            <section className="hp-section-dark" id="testimonials">
                <div className="hp-section">
                    <h2 className="hp-section-title">What People <span className="accent">Say</span></h2>
                    <p className="hp-section-subtitle">Trusted by sellers, managers, and customers across India.</p>
                    <div className="testimonials-grid">
                        {testimonials.map((t, i) => (
                            <div className="testimonial-card" key={i}>
                                <p>{t.quote}</p>
                                <div className="testimonial-author">
                                    <div className="testimonial-avatar">{t.initial}</div>
                                    <div>
                                        <div className="testimonial-name">{t.name}</div>
                                        <div className="testimonial-role">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════ FAQ ══════ */}
            <section className="hp-section-alt" id="faq">
                <div className="hp-section">
                    <h2 className="hp-section-title">Frequently Asked <span className="accent">Questions</span></h2>
                    <p className="hp-section-subtitle">Got questions? We've got answers.</p>
                    <div className="faq-list">
                        {faqs.map((f, i) => (
                            <div className={`faq-item ${openFaq === i ? 'open' : ''}`} key={i}>
                                <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                    {f.q}
                                    <ChevronDown size={18} className="faq-chevron" />
                                </button>
                                {openFaq === i && <div className="faq-answer">{f.a}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════ FOOTER ══════ */}
            <footer className="landing-footer">
                <div className="footer-inner">
                    <div className="footer-top">
                        <div className="footer-brand">
                            <h3>THIS<span className="accent">AI</span></h3>
                            <p>AI-powered logistics platform delivering smarter, faster, and more reliably across India.</p>
                            <div className="footer-socials">
                                <a href="#" className="footer-social"><Linkedin size={16} /></a>
                                <a href="#" className="footer-social"><Twitter size={16} /></a>
                                <a href="#" className="footer-social"><Instagram size={16} /></a>
                            </div>
                        </div>
                        <div className="footer-col">
                            <h4>Company</h4>
                            <a href="#">About Us</a>
                            <a href="#">Careers</a>
                            <a href="#">Blog</a>
                            <a href="#">Press</a>
                        </div>
                        <div className="footer-col">
                            <h4>Support</h4>
                            <a href="#">Help Center</a>
                            <a href="#">Contact Us</a>
                            <a href="#">API Docs</a>
                            <a href="#">Status</a>
                        </div>
                        <div className="footer-col">
                            <h4>Legal</h4>
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Service</a>
                            <a href="#">Cookie Policy</a>
                            <a href="#">Refund Policy</a>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        © 2026 THISAI Logistics. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;

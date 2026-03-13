import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, AlertCircle, ArrowRight, X } from 'lucide-react';

const LocationRequiredModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{ 
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', 
            backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', zIndex: 1100, padding: '20px' 
        }}>
            <div className="dashboard-card" style={{ 
                width: '100%', maxWidth: '500px', padding: '2.5rem', 
                textAlign: 'center', position: 'relative',
                border: '1px solid rgba(var(--accent-rgb), 0.3)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
            }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={24} />
                </button>

                <div style={{ 
                    width: '70px', height: '70px', borderRadius: '50%', 
                    background: 'rgba(var(--accent-rgb), 0.1)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    margin: '0 auto 1.5rem auto' 
                }}>
                    <MapPin size={36} className="text-accent" />
                </div>

                <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'white' }}>Location Required</h2>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
                    To comply with our mandatory location policy, you must add your primary location (Residential, Warehouse, or Hub) to your profile before you can perform order-related actions.
                </p>

                <div style={{ background: 'rgba(255,59,48,0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,59,48,0.2)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <AlertCircle size={20} style={{ color: 'var(--danger)' }} />
                    <span style={{ fontSize: '0.9rem', color: 'var(--danger)', textAlign: 'left' }}>Action Blocked: Order creation requires a verified location.</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button 
                        onClick={() => {
                            onClose();
                            navigate('/settings/addresses');
                        }}
                        className="primary-btn flex items-center justify-center gap-2"
                        style={{ height: '50px', fontSize: '1.1rem' }}
                    >
                        Add Location Now <ArrowRight size={18} />
                    </button>
                    <button 
                        onClick={onClose}
                        className="secondary-btn"
                        style={{ height: '46px', background: 'transparent' }}
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LocationRequiredModal;

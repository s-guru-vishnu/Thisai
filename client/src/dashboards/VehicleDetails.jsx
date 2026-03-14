import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { 
    Truck, Shield, ShieldCheck, Gauge, 
    Calendar, ClipboardCheck, 
    ArrowLeft, Save, AlertTriangle, 
    Activity, FileText, Zap, Settings2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

const VehicleDetails = () => {
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(() => {
        const saved = localStorage.getItem('cargo_vehicle_info');
        return saved ? JSON.parse(saved) : {
            model: 'Eicher 2095xp',
            capacity: '6 Tons',
            regNumber: 'TN-38-BZ-2024',
            lastService: '2026-01-15',
            insuranceExpiry: '2027-01-15',
            fitnessExpiry: '2026-12-10',
            status: 'Operational'
        };
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ ...vehicle });

    const handleSave = () => {
        setVehicle(editForm);
        localStorage.setItem('cargo_vehicle_info', JSON.stringify(editForm));
        setIsEditing(false);
    };

    const specs = [
        { label: 'Model Series', value: vehicle.model, icon: Truck, color: '#3b82f6' },
        { label: 'Payload Capacity', value: vehicle.capacity, icon: Gauge, color: '#8b5cf6' },
        { label: 'Registration', value: vehicle.regNumber, icon: FileText, color: '#10b981' },
        { label: 'Vehicle Status', value: vehicle.status, icon: Activity, color: '#f59e0b' }
    ];

    const documents = [
        { name: 'Vehicle Insurance', expiry: vehicle.insuranceExpiry, status: 'Active', icon: ShieldCheck },
        { name: 'Fitness Certificate', expiry: vehicle.fitnessExpiry, status: 'Valid', icon: ClipboardCheck },
        { name: 'Pollution (PUC)', expiry: '2026-08-20', status: 'Active', icon: Zap },
        { name: 'Road Permit', expiry: '2027-03-01', status: 'Valid', icon: FileText }
    ];

    return (
        <div className="app-container" style={{ 
            background: '#09090b', 
            minHeight: '100vh', 
            color: '#fafafa',
            '--accent': '#3b82f6',
            '--accent-glow': 'rgba(59, 130, 246, 0.25)'
        }}>
            <Navbar />
            
            <main className="main-content" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <button 
                            onClick={() => navigate('/driver')}
                            style={{ background: '#18181b', border: '1px solid #27272a', color: 'white', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800' }}>Vehicle <span style={{ color: '#3b82f6' }}>Specs</span></h1>
                            <p style={{ margin: 0, color: '#71717a', fontSize: '0.9rem' }}>Fleet management and compliance monitoring.</p>
                        </div>
                    </div>
                    
                    {!isEditing ? (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="primary-btn"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', padding: '12px 24px' }}
                        >
                            <Settings2 size={18} /> Edit Specifications
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                onClick={handleSave}
                                className="primary-btn"
                                style={{ background: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', padding: '12px 24px' }}
                            >
                                <Save size={18} /> Save Changes
                            </button>
                            <button 
                                onClick={() => setIsEditing(false)}
                                style={{ background: '#27272a', border: 'none', color: 'white', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px', marginBottom: '2rem' }}>
                    {specs.map((s, idx) => (
                        <div key={idx} style={{ background: '#121214', border: '1px solid #27272a', padding: '24px', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ color: s.color, marginBottom: '12px' }}><s.icon size={24} /></div>
                            <div style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: 'bold', textTransform: 'uppercase' }}>{s.label}</div>
                            <div style={{ fontSize: '1.3rem', fontWeight: '800', marginTop: '4px' }}>{s.value}</div>
                            <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: `${s.color}05`, borderRadius: '50%', transform: 'translate(30%, -30%)' }}></div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                    {/* compliance & Documents */}
                    <div style={{ background: '#121214', border: '1px solid #27272a', padding: '2rem', borderRadius: '32px' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Shield color="#3b82f6" size={20} /> COMPLIANCE REPOSITORY
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {documents.map((doc, idx) => (
                                <div key={idx} style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    padding: '1.2rem', 
                                    background: '#18181b', 
                                    borderRadius: '16px',
                                    border: '1px solid #27272a'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '12px', color: '#3b82f6' }}>
                                            <doc.icon size={20} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '1rem' }}>{doc.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#71717a' }}>Expires: {doc.expiry}</div>
                                        </div>
                                    </div>
                                    <div style={{ 
                                        padding: '4px 12px', 
                                        borderRadius: '20px', 
                                        background: 'rgba(16, 185, 129, 0.1)', 
                                        color: '#10b981', 
                                        fontSize: '0.75rem', 
                                        fontWeight: '800',
                                        border: '1px solid rgba(16, 185, 129, 0.2)'
                                    }}>
                                        {doc.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Maintenance Log */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ background: '#121214', border: '1px solid #27272a', padding: '1.5rem', borderRadius: '32px' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Settings2 color="#3b82f6" size={20} /> TECHNICAL SPECS
                            </h3>
                            {isEditing ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', color: '#71717a', display: 'block', marginBottom: '8px' }}>VEHICLE MODEL</label>
                                        <input 
                                            value={editForm.model} 
                                            onChange={e => setEditForm({...editForm, model: e.target.value})}
                                            style={{ width: '100%', background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', padding: '12px', color: 'white' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', color: '#71717a', display: 'block', marginBottom: '8px' }}>REG NUMBER</label>
                                        <input 
                                            value={editForm.regNumber} 
                                            onChange={e => setEditForm({...editForm, regNumber: e.target.value})}
                                            style={{ width: '100%', background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', padding: '12px', color: 'white' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', color: '#71717a', display: 'block', marginBottom: '8px' }}>MAX CAPACITY</label>
                                        <input 
                                            value={editForm.capacity} 
                                            onChange={e => setEditForm({...editForm, capacity: e.target.value})}
                                            style={{ width: '100%', background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', padding: '12px', color: 'white' }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #27272a', paddingBottom: '12px' }}>
                                        <span style={{ color: '#71717a' }}>Engine Type</span>
                                        <span style={{ fontWeight: '600' }}>4-Cylinder Turbo</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #27272a', paddingBottom: '12px' }}>
                                        <span style={{ color: '#71717a' }}>Fuel System</span>
                                        <span style={{ fontWeight: '600' }}>Common Rail Direct</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #27272a', paddingBottom: '12px' }}>
                                        <span style={{ color: '#71717a' }}>Transmission</span>
                                        <span style={{ fontWeight: '600' }}>6-Speed Manual</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)', padding: '1.5rem', borderRadius: '24px', display: 'flex', gap: '15px' }}>
                            <div style={{ background: '#3b82f6', color: 'white', padding: '12px', borderRadius: '12px', height: 'fit-content' }}>
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#3b82f6' }}>MAINTENANCE ALERT</div>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#71717a' }}>Tire pressure rotation and oil filter replacement due in 1,200km.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                input:focus { outline: none; border-color: #3b82f6 !important; }
            `}</style>
        </div>
    );
};

export default VehicleDetails;

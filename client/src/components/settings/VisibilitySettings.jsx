import React, { useState } from 'react';
import { Eye, ShieldAlert, CheckCircle, Save } from 'lucide-react';
import axios from 'axios';

const VisibilitySettings = ({ userContext }) => {
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [visibility, setVisibility] = useState({
        publicProfile: userContext.visibility?.publicProfile || false,
        showStats: userContext.visibility?.showStats || false,
        showIntegrations: userContext.visibility?.showIntegrations || false,
        allowPartnerRequests: userContext.visibility?.allowPartnerRequests || false,
        allowDriverApplications: userContext.visibility?.allowDriverApplications || false,
        partnerAccess: userContext.visibility?.partnerAccess || false
    });

    const handleToggle = (key) => {
        setVisibility(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSaveVisibility = async () => {
        setLoading(true);
        setSuccessMessage('');
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
            const config = { headers: { Authorization: `Bearer ${userContext.token}` } };
            
            const { data } = await axios.put(`${apiBase}/api/auth/visibility`, visibility, config);
            
            const updatedContext = { ...userContext, visibility: data };
            localStorage.setItem('userInfo', JSON.stringify(updatedContext));
            
            setSuccessMessage('Visibility preferences saved');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error saving visibility:', error);
            alert('Failed to save visibility: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const ToggleRow = ({ label, description, stateKey }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '1rem' }}>
            <div style={{ paddingRight: '1rem' }}>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: 'white' }}>{label}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{description}</p>
            </div>
            <div 
                onClick={() => handleToggle(stateKey)}
                style={{
                    width: '46px', height: '24px', borderRadius: '12px',
                    background: visibility[stateKey] ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                    position: 'relative', cursor: 'pointer', transition: 'background 0.3s', flexShrink: 0
                }}
            >
                <div style={{
                    width: '20px', height: '20px', borderRadius: '50%', background: 'white',
                    position: 'absolute', top: '2px', left: visibility[stateKey] ? '24px' : '2px',
                    transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ margin: 0, fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Eye size={24} className="text-accent" /> Profiling & Visibility
                </h3>
                <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>Control what logistics data is publicly visible to vendors or customers.</p>
            </div>

            <section>
                <h4 style={{ color: 'var(--text-main)', marginBottom: '1.2rem', fontSize: '1.1rem' }}>Public Options</h4>
                <ToggleRow 
                    label="Public Company Profile" 
                    description="Allow your logistics profile to be discovered by partner networks." 
                    stateKey="publicProfile" 
                />
                <ToggleRow 
                    label="Show Delivery Statistics" 
                    description="Display your operational volume (e.g., Deliveries / Day) on public portals." 
                    stateKey="showStats" 
                />
                <ToggleRow 
                    label="Show Marketplace Integrations" 
                    description="Publicly list which e-commerce portals you natively support." 
                    stateKey="showIntegrations" 
                />
            </section>

            <section>
                <h4 style={{ color: 'var(--text-main)', marginBottom: '1.2rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={18} /> Partner & Network Access
                </h4>
                <ToggleRow 
                    label="Allow Partner Requests" 
                    description="Permit external logistics providers to send network connection requests." 
                    stateKey="allowPartnerRequests" 
                />
                <ToggleRow 
                    label="Allow Driver Applications" 
                    description="Enable open sign-ups for independent contractors to join your fleet." 
                    stateKey="allowDriverApplications" 
                />
                <ToggleRow 
                    label="Vendor Data Insights" 
                    description="Allow trusted marketplaces to connect and view operational downtime natively." 
                    stateKey="partnerAccess" 
                />
            </section>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                {successMessage ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }} className="fade-in">
                        <CheckCircle size={20} />
                        <span>{successMessage}</span>
                    </div>
                ) : <div />}
                
                <button onClick={handleSaveVisibility} disabled={loading} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {loading ? <span className="loader" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span> : <Save size={18} />}
                    {loading ? 'Saving...' : 'Save Preferences'}
                </button>
            </div>
        </div>
    );
};

export default VisibilitySettings;

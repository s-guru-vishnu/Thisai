import React, { useState } from 'react';
import { Link, Plus, CheckCircle, Trash2, Save, ShoppingBag, Truck, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const PlatformSettings = ({ userContext, showToast }) => {
    const [loading, setLoading] = useState(false);

    const getToken = () => userContext.token || JSON.parse(localStorage.getItem('userInfo') || '{}').token;
    
    // Defaults with realistic placeholders based on prompt
    const defaultEcommerce = [
        { name: 'Amazon Seller Central', accountId: '', status: 'Not Connected' },
        { name: 'Flipkart Seller Hub', accountId: '', status: 'Not Connected' },
        { name: 'Shopify', accountId: '', status: 'Not Connected' }
    ];
    
    const defaultLogistics = [
        { name: 'Delhivery', apiKey: '', webhook: '', status: 'Not Connected' },
        { name: 'DHL', apiKey: '', webhook: '', status: 'Not Connected' },
        { name: 'BlueDart', apiKey: '', webhook: '', status: 'Not Connected' }
    ];

    const [platforms, setPlatforms] = useState({
        ecommerce: (userContext.platforms?.ecommerce?.length > 0) ? userContext.platforms.ecommerce : defaultEcommerce,
        logistics: (userContext.platforms?.logistics?.length > 0) ? userContext.platforms.logistics : defaultLogistics
    });

    const handleEcommerceChange = (index, field, value) => {
        const newArr = [...platforms.ecommerce];
        newArr[index][field] = value;
        setPlatforms({ ...platforms, ecommerce: newArr });
    };

    const handleLogisticsChange = (index, field, value) => {
        const newArr = [...platforms.logistics];
        newArr[index][field] = value;
        setPlatforms({ ...platforms, logistics: newArr });
    };

    const handleProviderStatus = (type, index, status) => {
        const newArr = [...platforms[type]];
        newArr[index].status = status;
        setPlatforms({ ...platforms, [type]: newArr });
    };

    const removeProvider = (type, index) => {
        const newArr = [...platforms[type]];
        newArr.splice(index, 1);
        setPlatforms({ ...platforms, [type]: newArr });
    };

    const addCustomPlatform = (type) => {
        const newArr = [...platforms[type]];
        if (type === 'ecommerce') {
            newArr.push({ name: 'Custom Store', accountId: '', status: 'Not Connected' });
        } else {
            newArr.push({ name: 'Custom Carrier API', apiKey: '', webhook: '', status: 'Not Connected' });
        }
        setPlatforms({ ...platforms, [type]: newArr });
    };

    const handleSavePlatforms = async () => {
        setLoading(true);
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            const config = { headers: { Authorization: `Bearer ${getToken()}` } };
            
            const { data } = await axios.put(`${apiBase}/api/auth/platforms`, platforms, config);
            
            // Update local storage - merge with existing to keep token
            const existingUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const updatedContext = { ...existingUserInfo, platforms: data };
            localStorage.setItem('userInfo', JSON.stringify(updatedContext));
            
            showToast('Integration platforms updated successfully');
        } catch (error) {
            console.error('Error updating platforms:', error);
            showToast('Failed to save platforms: ' + (error.response?.data?.message || error.message), 'error');
        } finally {
            setLoading(false);
        }
    };

    // Card Renderer for E-commerce
    const EcommerceCard = ({ item, index }) => (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem' }}>
                    <ShoppingBag size={18} className="text-accent" /> {item.name}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: item.status === 'Connected' ? 'var(--success)' : (item.status === 'Error' ? 'var(--danger)' : 'var(--text-muted)') }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.status === 'Connected' ? 'var(--success)' : (item.status === 'Error' ? 'var(--danger)' : 'gray') }} />
                    {item.status}
                </div>
            </div>
            
            <input 
                value={item.accountId} 
                onChange={(e) => handleEcommerceChange(index, 'accountId', e.target.value)}
                placeholder="Account ID or Store URL"
                className="settings-input"
            />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '10px' }}>
                {item.status !== 'Connected' ? (
                    <button onClick={() => handleProviderStatus('ecommerce', index, 'Connected')} style={{ background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.85rem' }}>Connect</button>
                ) : (
                    <button onClick={() => handleProviderStatus('ecommerce', index, 'Not Connected')} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.85rem' }}>Disconnect</button>
                )}
                
                <button onClick={() => removeProvider('ecommerce', index)} style={{ background: 'transparent', color: 'var(--danger)', border: 'none', cursor: 'pointer', padding: '6px' }}>
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );

    // Card Renderer for Logistics
    const LogisticsCard = ({ item, index }) => {
        const [showApiKey, setShowApiKey] = useState(false);
        
        return (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem' }}>
                        <Truck size={18} className="text-accent" /> {item.name}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: item.status === 'Connected' ? 'var(--success)' : (item.status === 'Error' ? 'var(--danger)' : 'var(--text-muted)') }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.status === 'Connected' ? 'var(--success)' : (item.status === 'Error' ? 'var(--danger)' : 'gray') }} />
                        {item.status}
                    </div>
                </div>
                
                <div style={{ position: 'relative' }}>
                    <input 
                        value={item.apiKey} 
                        onChange={(e) => handleLogisticsChange(index, 'apiKey', e.target.value)}
                        placeholder="API Key"
                        type={showApiKey ? "text" : "password"}
                        className="settings-input"
                        style={{ paddingRight: '45px' }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                    >
                        {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <input 
                    value={item.webhook} 
                    onChange={(e) => handleLogisticsChange(index, 'webhook', e.target.value)}
                    placeholder="Webhook URL (Optional)"
                    className="settings-input"
                />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '10px' }}>
                    {item.status !== 'Connected' ? (
                        <button onClick={() => handleProviderStatus('logistics', index, 'Connected')} style={{ background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.85rem' }}>Connect</button>
                    ) : (
                        <button onClick={() => handleProviderStatus('logistics', index, 'Not Connected')} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.85rem' }}>Disconnect</button>
                    )}
                    
                    <button onClick={() => removeProvider('logistics', index)} style={{ background: 'transparent', color: 'var(--danger)', border: 'none', cursor: 'pointer', padding: '6px' }}>
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        );
    };

    // Role-based visibility
    const role = userContext.role;
    const canSeeEcommerce = role === 'seller';
    const canSeeLogistics = ['admin', 'manager', 'seller'].includes(role);

    if (!canSeeEcommerce && !canSeeLogistics) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h3 style={{ color: 'var(--text-main)', marginBottom: '10px' }}>No Integrations Available</h3>
                <p style={{ color: 'var(--text-muted)' }}>Platform integrations are currently not available for your role.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ margin: 0, fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Link size={24} className="text-accent" /> Platform Integrations
                </h3>
                <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>Sync your channels and networks automatically.</p>
            </div>

            {/* E-Commerce Section */}
            {canSeeEcommerce && (
                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h4 style={{ color: 'var(--text-main)', margin: 0, fontSize: '1.1rem' }}>E-commerce Marketplaces</h4>
                        <button onClick={() => addCustomPlatform('ecommerce')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', color: 'var(--text-main)', border: '1px dashed var(--border-color)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                            <Plus size={14} /> Add Platform
                        </button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {platforms.ecommerce.map((item, i) => <EcommerceCard key={i} item={item} index={i} />)}
                    </div>
                </section>
            )}

            {/* Logistics APIs Section */}
            {canSeeLogistics && (
                <section style={{ borderTop: canSeeEcommerce ? '1px solid var(--border-color)' : 'none', paddingTop: canSeeEcommerce ? '2.5rem' : '0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h4 style={{ color: 'var(--text-main)', margin: 0, fontSize: '1.1rem' }}>Logistics & Courier APIs</h4>
                        <button onClick={() => addCustomPlatform('logistics')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', color: 'var(--text-main)', border: '1px dashed var(--border-color)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                            <Plus size={14} /> Add Provider
                        </button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {platforms.logistics.map((item, i) => <LogisticsCard key={i} item={item} index={i} />)}
                    </div>
                </section>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                
                <button onClick={handleSavePlatforms} disabled={loading} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '10px', transition: 'opacity 0.2s' }}>
                    {loading ? <span className="loader" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span> : <Save size={18} />}
                    {loading ? 'Saving...' : 'Save Integrations'}
                </button>
            </div>

            <style>{`
                .settings-input {
                    width: 100%;
                    padding: 10px 12px;
                    border-radius: 6px;
                    background: rgba(0,0,0,0.3);
                    border: 1px solid var(--border-color);
                    color: white;
                    outline: none;
                    font-size: 0.9rem;
                    transition: all 0.2s ease;
                }
                .settings-input:focus {
                    border-color: var(--accent);
                    background: rgba(0,0,0,0.4);
                }
            `}</style>
        </div>
    );
};

export default PlatformSettings;

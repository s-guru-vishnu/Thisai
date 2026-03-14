import React, { useState, useEffect } from 'react';
import { Palette, Moon, Sun, Monitor, CheckCircle } from 'lucide-react';
import axios from 'axios';

const ACCENT_COLORS = [
    { name: 'Purple', value: '#6C63FF' },
    { name: 'Blue', value: '#007AFF' },
    { name: 'Teal', value: '#00C4B4' },
    { name: 'Green', value: '#34A853' },
    { name: 'Orange', value: '#FF8A00' },
    { name: 'Pink', value: '#FF2A7B' }
];

const AppearanceSettings = ({ userContext, showToast }) => {
    const defaultPreferences = userContext.preferences || { theme: 'system', accentColor: '#FF8A00' };
    
    const [preferences, setPreferences] = useState(defaultPreferences);
    const [loading, setLoading] = useState(false);

    const getToken = () => userContext.token || JSON.parse(localStorage.getItem('userInfo') || '{}').token;

    // Apply accent color and force dark mode
    useEffect(() => {
        document.documentElement.style.setProperty('--accent', preferences.accentColor);
        document.documentElement.style.setProperty('--accent-glow', `${preferences.accentColor}40`);
        document.documentElement.style.setProperty('--border-accent', `${preferences.accentColor}66`);

        // Force Dark Mode for premium aesthetic
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
    }, [preferences.accentColor]);

    const handleColorChange = (hex) => {
        setPreferences({ ...preferences, accentColor: hex });
    };

    const handleSavePreferences = async () => {
        setLoading(true);
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            const config = { headers: { Authorization: `Bearer ${getToken()}` } };
            
            await axios.put(`${apiBase}/api/auth/preferences`, preferences, config);
            
            // Update local storage - merge with existing to keep token
            const existingUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const updatedUser = { ...existingUserInfo, preferences };
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));

            showToast('Appearance settings saved successfully');
        } catch (error) {
            console.error('Error saving preferences:', error);
            showToast('Failed to save appearance: ' + (error.response?.data?.message || error.message), 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', animation: 'fadeIn 0.3s ease' }}>
            
            {/* Accent Color Selection */}
            <section style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2.5rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 5px 0', color: 'var(--text-main)' }}>
                        <Palette size={20} className="text-accent" /> Accent Color
                    </h3>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Customize your primary highlight color across the platform.</p>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                    {ACCENT_COLORS.map(color => (
                        <button
                            key={color.name}
                            onClick={() => handleColorChange(color.value)}
                            title={color.name}
                            style={{
                                width: '45px', height: '45px', borderRadius: '50%',
                                background: color.value, border: 'none', cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                transform: preferences.accentColor === color.value ? 'scale(1.1)' : 'scale(1)',
                                boxShadow: preferences.accentColor === color.value ? `0 0 15px ${color.value}80, inset 0 0 0 3px var(--bg-primary)` : 'none'
                            }}
                        />
                    ))}
                </div>
            </section>

            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                
                <button onClick={handleSavePreferences} disabled={loading} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', padding: '10px 24px' }}>
                    {loading ? 'Saving...' : 'Save Appearance'}
                </button>
            </div>
        </div>
    );
};

export default AppearanceSettings;

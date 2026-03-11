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

const AppearanceSettings = ({ userContext }) => {
    const defaultPreferences = userContext.preferences || { theme: 'system', accentColor: '#6C63FF' };
    
    const [preferences, setPreferences] = useState(defaultPreferences);
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    // Apply accent color to document root immediately
    useEffect(() => {
        document.documentElement.style.setProperty('--accent', preferences.accentColor);
        document.documentElement.style.setProperty('--accent-glow', `${preferences.accentColor}40`);
        document.documentElement.style.setProperty('--border-accent', `${preferences.accentColor}66`);

        if (preferences.theme === 'dark') {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
        } else if (preferences.theme === 'light') {
            document.body.classList.add('light-mode');
            document.body.classList.remove('dark-mode');
        } else {
            // System
            document.body.classList.remove('dark-mode', 'light-mode');
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.add('light-mode');
            }
        }
    }, [preferences]);

    const handleThemeChange = (theme) => {
        setPreferences({ ...preferences, theme });
    };

    const handleColorChange = (hex) => {
        setPreferences({ ...preferences, accentColor: hex });
    };

    const handleSavePreferences = async () => {
        setLoading(true);
        setSaved(false);
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
            const config = { headers: { Authorization: `Bearer ${userContext.token}` } };
            
            await axios.put(`${apiBase}/api/auth/preferences`, preferences, config);
            
            // Update local storage
            const updatedUser = { ...userContext, preferences };
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
            localStorage.setItem('theme', preferences.theme);

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Error saving preferences:', error);
            alert('Failed to save appearance: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', animation: 'fadeIn 0.3s ease' }}>
            
            {/* Theme Selection */}
            <section>
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 5px 0', color: 'var(--text-main)' }}>
                        <Moon size={20} className="text-accent" /> Theme Preference
                    </h3>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Choose how you'd like the application to look.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                    <button 
                        onClick={() => handleThemeChange('light')}
                        style={{ 
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', 
                            padding: '1.5rem', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
                            background: preferences.theme === 'light' ? 'rgba(255,255,255,0.05)' : 'transparent',
                            border: preferences.theme === 'light' ? '2px solid var(--accent)' : '2px solid var(--border-color)'
                        }}
                    >
                        <Sun size={32} style={{ color: preferences.theme === 'light' ? 'var(--accent)' : 'var(--text-muted)' }} />
                        <span style={{ fontWeight: '500', color: preferences.theme === 'light' ? 'white' : 'var(--text-muted)' }}>Light</span>
                    </button>

                    <button 
                        onClick={() => handleThemeChange('dark')}
                        style={{ 
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', 
                            padding: '1.5rem', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
                            background: preferences.theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'transparent',
                            border: preferences.theme === 'dark' ? '2px solid var(--accent)' : '2px solid var(--border-color)'
                        }}
                    >
                        <Moon size={32} style={{ color: preferences.theme === 'dark' ? 'var(--accent)' : 'var(--text-muted)' }} />
                        <span style={{ fontWeight: '500', color: preferences.theme === 'dark' ? 'white' : 'var(--text-muted)' }}>Dark</span>
                    </button>

                    <button 
                        onClick={() => handleThemeChange('system')}
                        style={{ 
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', 
                            padding: '1.5rem', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
                            background: preferences.theme === 'system' ? 'rgba(255,255,255,0.05)' : 'transparent',
                            border: preferences.theme === 'system' ? '2px solid var(--accent)' : '2px solid var(--border-color)'
                        }}
                    >
                        <Monitor size={32} style={{ color: preferences.theme === 'system' ? 'var(--accent)' : 'var(--text-muted)' }} />
                        <span style={{ fontWeight: '500', color: preferences.theme === 'system' ? 'white' : 'var(--text-muted)' }}>System</span>
                    </button>
                </div>
            </section>

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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                {saved ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }} className="fade-in">
                        <CheckCircle size={20} />
                        <span>Appearance updated successfully</span>
                    </div>
                ) : <div />}
                
                <button onClick={handleSavePreferences} disabled={loading} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', padding: '10px 24px' }}>
                    {loading ? 'Saving...' : 'Save Appearance'}
                </button>
            </div>
        </div>
    );
};

export default AppearanceSettings;

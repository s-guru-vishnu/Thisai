import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

/**
 * Premium Loading Screen component using Lottie animations.
 * Can be used as a full-screen overlay or as an inline loader.
 * 
 * @param {boolean} fullScreen - Whether to show as a full-screen overlay.
 * @param {string} message - Optional loading message to display.
 */
const LoadingScreen = ({ fullScreen = true, message = "Initialising Neural Engine..." }) => {
    const containerStyle = fullScreen ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(11, 11, 12, 0.95)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    } : {
        width: '100%',
        height: '100%',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent'
    };

    return (
        <div className="loading-screen-wrapper" style={containerStyle}>
            <div style={{ width: '200px', height: '200px', filter: 'drop-shadow(0 0 20px var(--accent-glow, rgba(255, 107, 0, 0.3)))' }}>
                <DotLottieReact
                    src="https://lottie.host/6976265d-8b7b-4f60-b08a-f9229bae7b06/tbkXDufkKC.lottie"
                    loop
                    autoplay
                />
            </div>
            {message && (
                <div style={{ 
                    marginTop: '20px', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: 'var(--text-muted, #a0a0a0)',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    animation: 'pulse 2s infinite'
                }}>
                    {message}
                </div>
            )}
            <style>
                {`
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                    }
                `}
            </style>
        </div>
    );
};

export default LoadingScreen;

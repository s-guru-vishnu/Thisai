import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-color, #0a0a0a)',
            color: 'white',
            textAlign: 'center',
            padding: '2rem',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Background Decor */}
            <div style={{
                position: 'absolute',
                top: '10%',
                left: '5%',
                width: '300px',
                height: '300px',
                background: 'var(--accent, #ff6b00)',
                filter: 'blur(150px)',
                opacity: 0.1,
                borderRadius: '50%',
                zIndex: 0
            }}></div>

            <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', width: '100%' }}>
                <div style={{ 
                    width: '100%', 
                    aspectRatio: '1/1', 
                    maxWidth: '400px', 
                    margin: '0 auto',
                    filter: 'drop-shadow(0 0 30px rgba(255,107,0,0.2))'
                }}>
                    <DotLottieReact
                        src="https://lottie.host/7cad52d8-a00a-4662-ba57-19ce6b739e80/7Fv1eocoJl.lottie"
                        loop
                        autoplay
                    />
                </div>

                <h1 style={{ 
                    fontSize: 'clamp(2rem, 8vw, 3.5rem)', 
                    fontWeight: '900', 
                    margin: '-20px 0 10px',
                    letterSpacing: '-1px',
                    background: 'linear-gradient(135deg, #fff 0%, #888 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    LOST IN SPACE?
                </h1>
                
                <p style={{ 
                    fontSize: '1.2rem', 
                    color: 'var(--text-muted, #888)', 
                    marginBottom: '2.5rem',
                    lineHeight: '1.6'
                }}>
                    The page you're looking for has drifted out of orbit. <br/>
                    Let's get you back to the hub.
                </p>

                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button 
                        onClick={() => navigate(-1)}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color, #333)',
                            background: 'rgba(255,255,255,0.05)',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        <ArrowLeft size={20} /> Go Back
                    </button>
                    
                    <button 
                        onClick={() => navigate('/')}
                        className="primary-btn pulse-glow"
                        style={{
                            padding: '12px 32px',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'var(--accent, #ff6b00)',
                            color: 'black',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontWeight: '800',
                            fontSize: '1rem'
                        }}
                    >
                        <Home size={20} /> Return Home
                    </button>
                </div>
            </div>

            {/* Subtle Grid Pattern */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                zIndex: -1
            }}></div>
        </div>
    );
};

export default NotFoundPage;

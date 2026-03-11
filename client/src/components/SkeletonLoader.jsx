import React from 'react';

const SkeletonLoader = ({ type = 'form' }) => {
    if (type === 'form') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', animation: 'pulse 1.5s infinite ease-in-out' }}>
                <div style={{ height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', width: '60%' }}></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} style={{ height: '70px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}></div>
                    ))}
                </div>
                <div style={{ height: '45px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', width: '150px', marginLeft: 'auto' }}></div>
                
                <style>{`
                    @keyframes pulse {
                        0% { opacity: 0.5; }
                        50% { opacity: 1; }
                        100% { opacity: 0.5; }
                    }
                `}</style>
            </div>
        );
    }

    return null;
};

export default SkeletonLoader;

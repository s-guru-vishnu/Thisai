import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import Navbar from '../components/Navbar';
import { Camera, ArrowLeft, ShieldCheck, Zap, StopCircle, RefreshCw } from 'lucide-react';
import '../styles/dashboard.css';

const ReceiverScanner = () => {
    const navigate = useNavigate();
    const [scanResult, setScanResult] = useState(null);
    const [cameras, setCameras] = useState([]);
    const [activeCameraId, setActiveCameraId] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const html5QrCodeRef = useRef(null);
    const scannerContainerId = "reader";

    useEffect(() => {
        // Fetch available cameras
        Html5Qrcode.getCameras().then(devices => {
            if (devices && devices.length > 0) {
                setCameras(devices);
                setActiveCameraId(devices[0].id);
            }
        }).catch(err => {
            console.error("Error getting cameras", err);
        });

        // Cleanup on unmount
        return () => {
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                html5QrCodeRef.current.stop().catch(err => console.error("Error stopping scanner", err));
            }
        };
    }, []);

    const startScanning = async (cameraId) => {
        if (!cameraId) return;

        try {
            if (!html5QrCodeRef.current) {
                html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
            }

            // Stop any existing scan if running
            if (html5QrCodeRef.current.isScanning) {
                await html5QrCodeRef.current.stop();
            }

            await html5QrCodeRef.current.start(
                cameraId,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                },
                (decodedText) => {
                    handleScanSuccess(decodedText.toUpperCase());
                },
                (errorMessage) => {
                    // Item not found or scan failure
                }
            );
            setIsScanning(true);
        } catch (err) {
            console.error("Unable to start scanning", err);
        }
    };

    const stopScanning = async () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
            try {
                await html5QrCodeRef.current.stop();
                setIsScanning(false);
            } catch (err) {
                console.error("Unable to stop scanning", err);
            }
        }
    };

    const handleScanSuccess = async (code) => {
        await stopScanning();

        const localDeliveries = JSON.parse(localStorage.getItem('sellerDeliveries') || '[]');
        const updated = localDeliveries.map(d => {
            if (d.trackingCode === code) {
                return { ...d, status: 'Received' };
            }
            return d;
        });
        localStorage.setItem('sellerDeliveries', JSON.stringify(updated));
        setScanResult(code);

        setTimeout(() => {
            navigate('/receiver');
        }, 2500);
    };

    const handleCameraChange = (e) => {
        const newId = e.target.value;
        setActiveCameraId(newId);
        if (isScanning) {
            startScanning(newId);
        }
    };

    return (
        <div className="app-container" style={{ background: '#000', minHeight: '100vh' }}>
            <Navbar />

            <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '2rem' }}>

                <div style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <button onClick={() => navigate('/receiver')} style={{ background: 'transparent', border: 'none', color: '#ff6600', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '1rem' }}>
                            <ArrowLeft size={20} /> Back
                        </button>
                        <h2 style={{ margin: 0, color: '#fff' }}>Scanner <span style={{ color: '#ff6600' }}>Terminal</span></h2>
                    </div>

                    {!scanResult ? (
                        <div className="scanner-container">
                            <div style={{
                                border: '2px solid #ff6600',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                background: '#0a0a0a',
                                boxShadow: '0 0 30px rgba(255, 102, 0, 0.2)',
                                minHeight: '300px',
                                position: 'relative'
                            }}>
                                <div id={scannerContainerId} style={{ width: '100%' }}></div>
                            </div>

                            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <select
                                    className="custom-select"
                                    value={activeCameraId}
                                    onChange={handleCameraChange}
                                    style={{
                                        background: '#1a1a1a',
                                        color: '#ff6600',
                                        border: '1px solid #ff6600',
                                        padding: '12px',
                                        borderRadius: '10px',
                                        width: '100%',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {cameras.map(camera => (
                                        <option key={camera.id} value={camera.id}>{camera.label || `Camera ${camera.id}`}</option>
                                    ))}
                                </select>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {!isScanning ? (
                                        <button
                                            onClick={() => startScanning(activeCameraId)}
                                            className="action-btn-primary"
                                            style={{ flex: 1, background: '#ff6600', color: '#000', border: 'none', padding: '15px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                        >
                                            <Camera size={20} /> START TERMINAL
                                        </button>
                                    ) : (
                                        <button
                                            onClick={stopScanning}
                                            className="action-btn-danger"
                                            style={{ flex: 1, background: '#333', color: '#fff', border: '1px solid #ff6600', padding: '15px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                        >
                                            <StopCircle size={20} /> STOP SCANNING
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div style={{ marginTop: '30px', padding: '1.5rem', background: 'rgba(255, 102, 0, 0.05)', borderRadius: '15px', border: '1px solid rgba(255, 102, 0, 0.1)' }}>
                                <RefreshCw size={24} style={{ color: '#ff6600', marginBottom: '10px' }} />
                                <h4 style={{ color: '#fff', margin: '0 0 5px 0' }}>Detection Service</h4>
                                <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>Align the QR code within the highlighted frame for instant verification.</p>
                            </div>
                        </div>
                    ) : (
                        <div style={{ padding: '3rem 2rem', background: 'rgba(0, 204, 102, 0.05)', borderRadius: '20px', border: '2px solid #00cc66', animation: 'zoomIn 0.3s ease' }}>
                            <ShieldCheck size={64} style={{ color: '#00cc66', marginBottom: '1.5rem' }} />
                            <h2 style={{ color: '#fff', marginBottom: '10px' }}>Verification Successful</h2>
                            <p style={{ color: '#00cc66', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '20px' }}>Code: {scanResult}</p>
                            <p style={{ color: '#888' }}>The package has been marked as <strong>Received</strong>. Redirecting you back to terminal...</p>
                            <div className="loading-bar-container" style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '2rem' }}>
                                <div style={{ width: '100%', height: '100%', background: '#00cc66', borderRadius: '2px', animation: 'progress 2.5s linear' }}></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Decorative Elements */}
                <div style={{ position: 'fixed', bottom: '30px', left: '30px', opacity: 0.3, pointerEvents: 'none' }}>
                    <Zap size={100} style={{ color: '#ff6600' }} />
                </div>
            </main>

            <style>{`
                @keyframes progress {
                    from { width: 0%; }
                    to { width: 100%; }
                }

                #reader video {
                    object-fit: cover !important;
                    width: 100% !important;
                    height: 100% !important;
                    min-height: 300px !important;
                }

                .action-btn-primary:hover {
                    background: #e65c00 !important;
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(255, 102, 0, 0.4);
                }

                .action-btn-danger:hover {
                    background: #444 !important;
                    transform: translateY(-2px);
                }

                @keyframes zoomIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default ReceiverScanner;

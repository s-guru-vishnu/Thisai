import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 400); // Wait for fade-out animation
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`toast-container ${isVisible ? 'show' : 'hide'}`}>
            <div className={`toast-content ${type}`}>
                {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <span>{message}</span>
                <button onClick={() => setIsVisible(false)} className="toast-close">
                    <X size={16} />
                </button>
            </div>

            <style>{`
                .toast-container {
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 9999;
                    pointer-events: none;
                }
                .toast-content {
                    pointer-events: auto;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 20px;
                    border-radius: 50px;
                    background: rgba(17, 17, 17, 0.9);
                    backdrop-filter: blur(10px);
                    border: 1px solid var(--border-color);
                    color: white;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    min-width: 300px;
                }
                .toast-content.success {
                    border-color: #00cc66;
                    color: #00cc66;
                }
                .toast-content.error {
                    border-color: #ff3300;
                    color: #ff3300;
                }
                .toast-close {
                    margin-left: auto;
                    background: transparent;
                    border: none;
                    color: inherit;
                    cursor: pointer;
                    opacity: 0.6;
                }
                .toast-close:hover { opacity: 1; }
                
                .show {
                    animation: slideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                .hide {
                    animation: fadeOut 0.4s ease forwards;
                }
                
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-20px) translateX(-50%); }
                    to { opacity: 1; transform: translateY(0) translateX(-50%); }
                }
                @keyframes fadeOut {
                    from { opacity: 1; transform: translateY(0) translateX(-50%); }
                    to { opacity: 0; transform: translateY(-20px) translateX(-50%); }
                }
            `}</style>
        </div>
    );
};

export default Toast;

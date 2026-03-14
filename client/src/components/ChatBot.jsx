import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageSquare, Send, X, Bot, Loader, User, Minimize2, ExternalLink } from 'lucide-react';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am Thisai AI. I can explain our logistics decisions, route choices, and fairness scoring. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isLoggedIn = !!userInfo.token;

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            const { data } = await axios.post(`${apiBase}/api/ai/chat`, 
                { message: input },
                { headers: { Authorization: `Bearer ${userInfo.token}` } }
            );

            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting to my AI engine. Please ensure the n8n webhook workflow is active and accessible." }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isLoggedIn) return null;

    return (
        <div className={`chatbot-container ${isOpen ? 'active' : ''} ${minimized ? 'minimized' : ''}`} style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            fontFamily: 'inherit'
        }}>
            {/* Chat Window */}
            {isOpen && !minimized && (
                <div className="chat-window pulse-glow" style={{
                    width: '380px',
                    height: '550px',
                    backgroundColor: 'var(--panel-bg, #161618)',
                    borderRadius: '24px',
                    border: '1px solid var(--border-accent, rgba(255,107,0,0.3))',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    marginBottom: '20px',
                    animation: 'slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                    {/* Header */}
                    <div className="chat-header" style={{
                        padding: '1.2rem',
                        background: 'linear-gradient(135deg, var(--accent, #ff6b00), #ff9100)',
                        color: '#000',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontWeight: '800'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Bot size={22} />
                            <span>Thisai AI Expert</span>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setMinimized(true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><Minimize2 size={18} /></button>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="chat-messages" style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '15px'
                    }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%',
                                padding: '12px 16px',
                                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                background: msg.role === 'user' ? 'var(--accent, #ff6b00)' : 'rgba(255,255,255,0.05)',
                                color: msg.role === 'user' ? '#000' : 'var(--text-main, #eee)',
                                fontSize: '0.9rem',
                                lineHeight: '1.4',
                                display: 'flex',
                                gap: '8px',
                                position: 'relative',
                                boxShadow: msg.role === 'user' ? '0 4px 15px rgba(255,107,0,0.2)' : 'none'
                            }}>
                                {msg.role === 'assistant' && <div style={{ marginTop: '2px' }}><Bot size={14} /></div>}
                                <span>{msg.content}</span>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                Thinking...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} style={{
                        padding: '1.2rem',
                        borderTop: '1px solid var(--border-color, rgba(255,255,255,0.05))',
                        display: 'flex',
                        gap: '10px'
                    }}>
                        <input
                            type="text"
                            placeholder="Ask about route logic or fairness..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            style={{
                                flex: 1,
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                padding: '0.8rem 1rem',
                                color: '#fff',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                        />
                        <button type="submit" disabled={loading} style={{
                            background: 'var(--accent, #ff6b00)',
                            color: '#000',
                            border: 'none',
                            borderRadius: '12px',
                            width: '45px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 15px rgba(255,107,0,0.3)'
                        }}>
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Button / Minimized Bar */}
            {minimized ? (
                <div 
                    onClick={() => setMinimized(false)}
                    style={{
                        background: 'linear-gradient(135deg, var(--accent, #ff6b00), #ff9100)',
                        padding: '10px 20px',
                        borderRadius: '30px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: '#000',
                        fontWeight: 'bold',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.4)',
                        animation: 'fadeIn 0.3s'
                    }}
                >
                    <Bot size={20} />
                    <span>Explainable AI Helper</span>
                </div>
            ) : (
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="pulse-glow"
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--accent, #ff6b00), #ff9100)',
                        color: '#000',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 10px 30px rgba(255,107,0,0.4)',
                        transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1) rotate(0)'}
                >
                    {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
                </button>
            )}

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(40px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .chatbot-container.active .pulse-glow {
                    animation: none !important;
                }
                .pulse-glow {
                    position: relative;
                }
                .pulse-glow::after {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    border-radius: inherit;
                    box-shadow: 0 0 0 0 rgba(255,107,0,0.6);
                    animation: pulse 2s infinite;
                    z-index: -1;
                }
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(255,107,0,0.7); }
                    70% { box-shadow: 0 0 0 20px rgba(255,107,0,0); }
                    100% { box-shadow: 0 0 0 0 rgba(255,107,0,0); }
                }
            `}</style>
        </div>
    );
};

export default ChatBot;

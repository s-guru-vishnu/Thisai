import React from 'react';
import { MoreVertical, Edit2, Trash2, Ban } from 'lucide-react';

const DataTable = ({ headers, data, actions }) => {
    return (
        <div className="table-responsive" style={{ overflowX: 'auto', background: 'var(--bg-panel)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                        {headers.map((header) => (
                            <th key={header} style={{ padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {header}
                            </th>
                        ))}
                        {actions && <th style={{ padding: '1.2rem', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid var(--border-color)', transition: 'var(--transition)' }} className="hover:bg-card-hover">
                            {Object.values(row).map((val, idx) => (
                                <td key={idx} style={{ padding: '1.2rem', color: 'white', fontSize: '0.95rem' }}>
                                    {typeof val === 'string' && val.toLowerCase().includes('admin') || val === 'Manager' || val === 'Warehouse' || val === 'Driver' ? (
                                        <span className={`status-pill ${val.toLowerCase()}`} style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            fontWeight: '700',
                                            background: val === 'Admin' ? 'rgba(255,107,0,0.1)' : 'rgba(23,162,184,0.1)',
                                            color: val === 'Admin' ? 'var(--accent)' : 'var(--info)',
                                            border: `1px solid ${val === 'Admin' ? 'rgba(255,107,0,0.2)' : 'rgba(23,162,184,0.2)'}`
                                        }}>
                                            {val}
                                        </span>
                                    ) : val}
                                </td>
                            ))}
                            {actions && (
                                <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <button className="icon-btn" title="Edit"><Edit2 size={16} /></button>
                                        <button className="icon-btn" title="Suspend"><Ban size={16} /></button>
                                        <button className="icon-btn danger" title="Delete"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <style>{`
                .hover\:bg-card-hover:hover {
                    background-color: var(--bg-card-hover);
                }
                .icon-btn {
                    background: transparent;
                    border: 1px solid var(--border-color);
                    color: var(--text-muted);
                    padding: 6px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: var(--transition);
                }
                .icon-btn:hover {
                    color: white;
                    border-color: var(--text-muted);
                }
                .icon-btn.danger:hover {
                    color: var(--danger);
                    border-color: var(--danger);
                    background: rgba(255,59,48,0.1);
                }
            `}</style>
        </div>
    );
};

export default DataTable;

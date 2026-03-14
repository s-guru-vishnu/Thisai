import React from 'react';
import { Edit2, Trash2, Ban, MoreVertical } from 'lucide-react';

const DataTable = ({ headers, data, onEdit, onSuspend, onDelete }) => {
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
                        <th style={{ padding: '1.2rem', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid var(--border-color)', transition: 'var(--transition)' }} className="table-row-hover">
                            {Object.values(row).map((val, idx) => (
                                <td key={idx} style={{ padding: '1.2rem', color: 'white', fontSize: '0.95rem' }}>
                                    {typeof val === 'string' && (val === 'Admin' || val === 'Manager' || val === 'Warehouse' || val === 'Driver' || val === 'Suspended' || val === 'Customer' || val === 'Receiver' || val === 'Seller' || val === 'Cargo Driver') ? (
                                        <span className={`status-pill ${val.toLowerCase()}`}>
                                            {val}
                                        </span>
                                    ) : (
                                        typeof val === 'string' && val.includes('@') ? (
                                            <span style={{ color: 'var(--text-muted)' }}>{val}</span>
                                        ) : val
                                    )}
                                </td>
                            ))}
                            <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <button 
                                        className="action-btn edit" 
                                        onClick={() => onEdit && onEdit(row)}
                                        title="Edit User"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        className="action-btn suspend" 
                                        onClick={() => onSuspend && onSuspend(row)}
                                        title="Suspend User"
                                    >
                                        <Ban size={16} />
                                    </button>
                                    <button 
                                        className="action-btn delete" 
                                        onClick={() => onDelete && onDelete(row)}
                                        title="Delete User"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <style>{`
                .table-row-hover:hover {
                    background-color: rgba(255, 255, 255, 0.02);
                }
                .action-btn {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid var(--border-color);
                    color: var(--text-muted);
                    padding: 8px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .action-btn:hover {
                    transform: translateY(-2px);
                    background: var(--bg-primary);
                    color: white;
                    border-color: var(--text-muted);
                }
                .action-btn.edit:hover {
                    color: var(--info);
                    border-color: var(--info);
                    box-shadow: 0 0 10px rgba(23, 162, 184, 0.2);
                }
                .action-btn.suspend:hover {
                    color: var(--warning);
                    border-color: var(--warning);
                    box-shadow: 0 0 10px rgba(247, 147, 26, 0.2);
                }
                .action-btn.delete:hover {
                    color: var(--danger);
                    border-color: var(--danger);
                    background: rgba(255, 59, 48, 0.1);
                    box-shadow: 0 0 10px rgba(255, 59, 48, 0.2);
                }
                .status-pill {
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    white-space: nowrap;
                    border: 1px solid transparent;
                }
                .status-pill.admin { background: rgba(255,59,48,0.1); color: var(--danger); border-color: rgba(255,59,48,0.2); }
                .status-pill.manager { background: rgba(23,162,184,0.1); color: var(--info); border-color: rgba(23,162,184,0.2); }
                .status-pill.warehouse { background: rgba(247,147,26,0.1); color: var(--warning); border-color: rgba(247,147,26,0.2); }
                .status-pill.driver { background: rgba(22,199,132,0.1); color: var(--success); border-color: rgba(22,199,132,0.2); }
                .status-pill.suspended { background: rgba(255,59,48,0.1); color: var(--danger); border-color: rgba(255,59,48,0.2); }
                .status-pill.customer { background: rgba(163,163,163,0.1); color: var(--text-muted); border-color: rgba(163,163,163,0.2); }
                .status-pill.receiver { background: rgba(155,89,182,0.1); color: #9b59b6; border-color: rgba(155,89,182,0.2); }
                .status-pill.seller { background: rgba(52,152,219,0.1); color: #3498db; border-color: rgba(52,152,219,0.2); }
                .status-pill.cargo_driver { background: rgba(79, 70, 229, 0.1); color: #6366f1; border-color: rgba(79, 70, 229, 0.2); }
            `}</style>
        </div>
    );
};

export default DataTable;

import React from 'react';
import { Truck, Map, Clock, Package, Building, Hash, FileText, User, Users, MapPin, Inbox, Bell, Book, Mail } from 'lucide-react';

const ProfileDetailsSettings = ({ userContext }) => {
    const role = userContext.role || 'customer';

    const DetailItem = ({ label, value, icon: Icon }) => (
        <div className="detail-item" style={{ 
            background: 'rgba(255,255,255,0.03)', 
            padding: '1rem', 
            borderRadius: '12px', 
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                {Icon && <Icon size={14} />}
                <span style={{ fontSize: '0.8rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
            </div>
            <div style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: '600' }}>
                {value || <span style={{ color: 'rgba(255,255,255,0.1)', fontWeight: '400', fontStyle: 'italic' }}>Not Specified</span>}
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', textTransform: 'capitalize' }}>{role.replace('_', ' ')} ID Card</h3>
                    <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>Official role-specific identification and configuration.</p>
                </div>
                <div style={{ 
                    padding: '8px 16px', 
                    borderRadius: '20px', 
                    background: 'rgba(var(--accent-rgb), 0.1)', 
                    color: 'var(--accent)', 
                    fontSize: '0.8rem', 
                    fontWeight: '700',
                    border: '1px solid var(--accent)'
                }}>
                    VERIFIED {role.toUpperCase()}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                
                {/* ADMIN FIELDS */}
                {role === 'admin' && (
                    <>
                        <DetailItem label="Company Name" value={userContext.companyName} icon={Building} />
                        <DetailItem label="Company Type" value={userContext.companyType} icon={Book} />
                        <DetailItem label="Head Office" value={userContext.headOfficeAddress} icon={MapPin} />
                        <DetailItem label="Registration No." value={userContext.businessRegistrationNumber} icon={Hash} />
                        <DetailItem label="Warehouses" value={userContext.totalWarehouses} icon={Inbox} />
                        <DetailItem label="Drivers Managed" value={userContext.totalDrivers} icon={Users} />
                    </>
                )}

                {/* MANAGER FIELDS */}
                {role === 'manager' && (
                    <>
                        <DetailItem label="Department" value={userContext.department} icon={FileText} />
                        <DetailItem label="Region Overseen" value={userContext.deliveryRegion} icon={Map} />
                        <DetailItem label="Team Size" value={userContext.teamSize} icon={Users} />
                    </>
                )}

                {/* DRIVER FIELDS */}
                {role === 'driver' && (
                    <>
                        <DetailItem label="Driver License Number" value={userContext.driverLicenseNumber} icon={FileText} />
                        <DetailItem label="Vehicle Type" value={userContext.vehicleType} icon={Truck} />
                        <DetailItem label="Vehicle Plate Number" value={userContext.vehicleNumber} icon={Hash} />
                        <DetailItem label="Years of Experience" value={userContext.yearsOfExperience ? `${userContext.yearsOfExperience} Years` : null} icon={Clock} />
                    </>
                )}

                {/* CUSTOMER FIELDS */}
                {role === 'customer' && (
                    <>
                        <DetailItem label="Primary Address" value={userContext.defaultDeliveryAddress} icon={MapPin} />
                        <DetailItem label="Preferred Time" value={userContext.preferredDeliveryTime} icon={Clock} />
                        <DetailItem label="Contact Mode" value={userContext.contactPreference} icon={Mail} />
                        <DetailItem label="Live Alerts" value={userContext.orderNotifications ? "Enabled" : "Disabled"} icon={Bell} />
                    </>
                )}

                {/* RECEIVER FIELDS */}
                {role === 'parcel_receiver' && (
                    <>
                        <DetailItem label="Delivery Address" value={userContext.receiverAddress} icon={MapPin} />
                        <DetailItem label="Alt Contact" value={userContext.alternateContactNumber} icon={Mail} />
                        <DetailItem label="Instructions" value={userContext.deliveryInstructions} icon={FileText} />
                    </>
                )}

                {/* SELLER FIELDS */}
                {role === 'seller' && (
                    <>
                        <DetailItem label="Store Name" value={userContext.storeName} icon={Building} />
                        <DetailItem label="Business Type" value={userContext.businessType} icon={Book} />
                        <DetailItem label="Warehouse" value={userContext.warehouseLocation} icon={MapPin} />
                        <DetailItem label="Avg Daily Orders" value={userContext.averageDailyOrders} icon={Package} />
                        <DetailItem label="Return Address" value={userContext.returnAddress} icon={MapPin} />
                        <DetailItem label="GST Number" value={userContext.gstNumber} icon={Hash} />
                    </>
                )}
            </div>

            <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                borderRadius: '12px', 
                background: 'rgba(255, 107, 0, 0.05)', 
                border: '1px dashed var(--accent)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <div style={{ color: 'var(--accent)' }}><FileText size={20} /></div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    These details are verified and managed by the manager. To request changes or update your registration, please contact human resources or support.
                </p>
            </div>
            
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .detail-item:hover {
                    background: rgba(255,255,255,0.05) !important;
                    border-color: var(--accent) !important;
                    transition: all 0.3s ease;
                }
            `}</style>
        </div>
    );
};

export default ProfileDetailsSettings;

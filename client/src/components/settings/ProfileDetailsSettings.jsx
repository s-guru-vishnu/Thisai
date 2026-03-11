import React, { useState } from 'react';
import { Save, CheckCircle, Truck, Map, Clock, Package, Building, Hash, FileText, User, Users, MapPin, Inbox, Bell, Book, Mail } from 'lucide-react';
import axios from 'axios';

const ProfileDetailsSettings = ({ userContext, showToast }) => {
    const [loading, setLoading] = useState(false);
    
    // Initialize all possible fields smoothly to avoid uncontrolled warnings
    const [formData, setFormData] = useState({
        // Admin Fields
        companyName: userContext.companyName || '',
        companyType: userContext.companyType || '',
        headOfficeAddress: userContext.headOfficeAddress || '',
        totalWarehouses: userContext.totalWarehouses || '',
        totalDrivers: userContext.totalDrivers || '',
        businessRegistrationNumber: userContext.businessRegistrationNumber || '',

        // Manager Fields
        assignedWarehouse: userContext.assignedWarehouse || '',
        teamSize: userContext.teamSize || '',
        deliveryRegion: userContext.deliveryRegion || '',
        operatingShift: userContext.operatingShift || '',
        department: userContext.department || '',

        // Driver Fields
        driverLicenseNumber: userContext.driverLicenseNumber || '',
        vehicleType: userContext.vehicleType || '',
        vehicleNumber: userContext.vehicleNumber || '',
        yearsOfExperience: userContext.yearsOfExperience || '',
        assignedHub: userContext.assignedHub || '',
        workingShift: userContext.workingShift || '',

        // Customer Fields
        defaultDeliveryAddress: userContext.defaultDeliveryAddress || '',
        preferredDeliveryTime: userContext.preferredDeliveryTime || '',
        contactPreference: userContext.contactPreference || 'Email',
        orderNotifications: userContext.orderNotifications ?? true,

        // Receiver Fields
        receiverAddress: userContext.receiverAddress || '',
        alternateContactNumber: userContext.alternateContactNumber || '',
        deliveryInstructions: userContext.deliveryInstructions || '',

        // Seller Fields
        storeName: userContext.storeName || '',
        businessType: userContext.businessType || '',
        warehouseLocation: userContext.warehouseLocation || '',
        averageDailyOrders: userContext.averageDailyOrders || '',
        returnAddress: userContext.returnAddress || '',
        gstNumber: userContext.gstNumber || '',
    });

    const handleInputChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            const config = { headers: { Authorization: `Bearer ${userContext.token}` } };
            
            // Send everything; the backend allows strictly whitelisted fields
            const { data } = await axios.put(`${apiBase}/api/auth/profile`, formData, config);
            
            const updatedContext = { ...userContext, ...data };
            localStorage.setItem('userInfo', JSON.stringify(updatedContext));
            
            showToast('Profile details updated successfully');
        } catch (error) {
            console.error('Error updating details:', error);
            showToast('Failed to update details: ' + (error.response?.data?.message || error.message), 'error');
        } finally {
            setLoading(false);
        }
    };

    const role = userContext.role || 'customer';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ margin: 0, fontSize: '1.4rem', textTransform: 'capitalize' }}>{role.replace('_', ' ')} Details</h3>
                <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>Manage your role-specific operational configuration.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                
                {/* ADMIN FIELDS */}
                {role === 'admin' && (
                    <>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Company Name</label>
                            <input name="companyName" type="text" placeholder="Acme Logistics Inc." value={formData.companyName} onChange={handleInputChange} className="settings-input" />
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Company Type</label>
                            <select name="companyType" value={formData.companyType} onChange={handleInputChange} className="settings-select">
                                <option value="">Select Type</option>
                                <option value="Logistics Provider">Logistics Provider</option>
                                <option value="Warehouse Operator">Warehouse Operator</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Head Office Address</label>
                            <input name="headOfficeAddress" type="text" placeholder="123 HQ Blvd" value={formData.headOfficeAddress} onChange={handleInputChange} className="settings-input" />
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Business Registration Number</label>
                            <input name="businessRegistrationNumber" type="text" placeholder="REG-XX-12345" value={formData.businessRegistrationNumber} onChange={handleInputChange} className="settings-input" />
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Total Warehouses</label>
                            <input name="totalWarehouses" type="number" placeholder="0" value={formData.totalWarehouses} onChange={handleInputChange} className="settings-input" />
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Total Drivers Managed</label>
                            <input name="totalDrivers" type="number" placeholder="0" value={formData.totalDrivers} onChange={handleInputChange} className="settings-input" />
                        </div>
                    </>
                )}

                {/* MANAGER FIELDS */}
                {role === 'manager' && (
                    <>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Assigned Warehouse Location</label>
                            <input name="assignedWarehouse" type="text" placeholder="Warehouse Alpha" value={formData.assignedWarehouse} onChange={handleInputChange} className="settings-input" />
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Department</label>
                            <input name="department" type="text" placeholder="Fulfillment / Shipping" value={formData.department} onChange={handleInputChange} className="settings-input" />
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Delivery Region Overseen</label>
                            <input name="deliveryRegion" type="text" placeholder="North Zone" value={formData.deliveryRegion} onChange={handleInputChange} className="settings-input" />
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Operating Shift</label>
                            <select name="operatingShift" value={formData.operatingShift} onChange={handleInputChange} className="settings-select">
                                <option value="">Select Shift</option>
                                <option value="Morning">Morning (6AM - 2PM)</option>
                                <option value="Evening">Evening (2PM - 10PM)</option>
                                <option value="Night">Night (10PM - 6AM)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Team Size Managed</label>
                            <input name="teamSize" type="number" placeholder="0" value={formData.teamSize} onChange={handleInputChange} className="settings-input" />
                        </div>
                    </>
                )}

                {/* DRIVER FIELDS */}
                {role === 'driver' && (
                    <>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Driver License Number</label>
                            <input name="driverLicenseNumber" type="text" placeholder="DL-12345" value={formData.driverLicenseNumber} onChange={handleInputChange} className="settings-input" />
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Vehicle Type</label>
                            <select name="vehicleType" value={formData.vehicleType} onChange={handleInputChange} className="settings-select">
                                <option value="">Select Type</option>
                                <option value="Truck">Truck</option>
                                <option value="Van">Van</option>
                                <option value="Bike">Bike</option>
                                <option value="Mini Truck">Mini Truck</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Vehicle Plate Number</label>
                            <input name="vehicleNumber" type="text" placeholder="XY 12 AB 1234" value={formData.vehicleNumber} onChange={handleInputChange} className="settings-input" />
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Years of Experience</label>
                            <input name="yearsOfExperience" type="number" placeholder="0" value={formData.yearsOfExperience} onChange={handleInputChange} className="settings-input" />
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Assigned Hub</label>
                            <input name="assignedHub" type="text" placeholder="Central Dispatch" value={formData.assignedHub} onChange={handleInputChange} className="settings-input" />
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Working Shift</label>
                            <select name="workingShift" value={formData.workingShift} onChange={handleInputChange} className="settings-select">
                                <option value="">Select Shift</option>
                                <option value="Day Shift">Day Shift</option>
                                <option value="Night Shift">Night Shift</option>
                            </select>
                        </div>
                    </>
                )}

                {/* CUSTOMER FIELDS */}
                {role === 'customer' && (
                    <>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Default Delivery Address</label>
                            <input name="defaultDeliveryAddress" type="text" placeholder="123 Home St, Suite 4B" value={formData.defaultDeliveryAddress} onChange={handleInputChange} className="settings-input" />
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Preferred Delivery Time</label>
                            <select name="preferredDeliveryTime" value={formData.preferredDeliveryTime} onChange={handleInputChange} className="settings-select">
                                <option value="">Select Option</option>
                                <option value="Morning (9AM - 12PM)">Morning (9AM - 12PM)</option>
                                <option value="Afternoon (12PM - 4PM)">Afternoon (12PM - 4PM)</option>
                                <option value="Evening (4PM - 8PM)">Evening (4PM - 8PM)</option>
                                <option value="Anytime">Anytime</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Contact Preference</label>
                            <select name="contactPreference" value={formData.contactPreference} onChange={handleInputChange} className="settings-select">
                                <option value="Email">Email</option>
                                <option value="SMS">SMS</option>
                                <option value="App Notification">App Notification</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '30px' }}>
                            <input type="checkbox" name="orderNotifications" checked={formData.orderNotifications} onChange={handleInputChange} style={{ width: '20px', height: '20px', accentColor: 'var(--accent)' }}/>
                            <label style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>Receive Live Order Notifications</label>
                        </div>
                    </>
                )}

                {/* RECEIVER FIELDS */}
                {role === 'parcel_receiver' && (
                    <>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Receiver Address</label>
                            <input name="receiverAddress" type="text" placeholder="Delivery destination address" value={formData.receiverAddress} onChange={handleInputChange} className="settings-input" />
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Alternate Contact Number</label>
                            <input name="alternateContactNumber" type="text" placeholder="+1 ..." value={formData.alternateContactNumber} onChange={handleInputChange} className="settings-input" />
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Preferred Delivery Time</label>
                            <select name="preferredDeliveryTime" value={formData.preferredDeliveryTime} onChange={handleInputChange} className="settings-select">
                                <option value="">Select Option</option>
                                <option value="Morning">Morning</option>
                                <option value="Afternoon">Afternoon</option>
                                <option value="Evening">Evening</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Delivery Instructions</label>
                            <textarea name="deliveryInstructions" placeholder="e.g. Leave at security, call before delivery" value={formData.deliveryInstructions} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white', minHeight: '80px', resize: 'vertical' }} />
                        </div>
                    </>
                )}

                {/* SELLER FIELDS */}
                {role === 'seller' && (
                    <>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Store Name</label>
                            <input name="storeName" type="text" placeholder="My E-Commerce Store" value={formData.storeName} onChange={handleInputChange} className="settings-input" />
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Business Type</label>
                            <select name="businessType" value={formData.businessType} onChange={handleInputChange} className="settings-select">
                                <option value="">Select Option</option>
                                <option value="E-commerce">E-commerce</option>
                                <option value="Retail">Retail</option>
                                <option value="Wholesale">Wholesale</option>
                                <option value="Manufacturer">Manufacturer</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Warehouse / Pickup Location</label>
                            <input name="warehouseLocation" type="text" placeholder="Seller Warehouse Address" value={formData.warehouseLocation} onChange={handleInputChange} className="settings-input" />
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Average Daily Orders</label>
                            <input name="averageDailyOrders" type="number" placeholder="0" value={formData.averageDailyOrders} onChange={handleInputChange} className="settings-input" />
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Return Address</label>
                            <input name="returnAddress" type="text" placeholder="Where should items be returned?" value={formData.returnAddress} onChange={handleInputChange} className="settings-input" />
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>GST Number</label>
                            <input name="gstNumber" type="text" placeholder="GST-XX-123456" value={formData.gstNumber} onChange={handleInputChange} className="settings-input" />
                        </div>
                    </>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                
                <button onClick={handleSaveProfile} disabled={loading} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '10px', transition: 'opacity 0.2s' }}>
                    {loading ? <span className="loader" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span> : <Save size={18} />}
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
            
            <style>{`
                .settings-input {
                    width: 100%;
                    padding: 12px;
                    border-radius: 8px;
                    background: rgba(0,0,0,0.3);
                    border: 1px solid var(--border-color);
                    color: white;
                    outline: none;
                    transition: all 0.2s ease;
                }
                .settings-input:focus {
                    border-color: var(--accent);
                    background: rgba(0,0,0,0.4);
                }
                .settings-select {
                    width: 100%;
                    padding: 12px;
                    border-radius: 8px;
                    background: #1c1c1e;
                    border: 1px solid var(--border-color);
                    color: white;
                    outline: none;
                    transition: border-color 0.2s ease;
                }
                .settings-select:focus {
                    border-color: var(--accent);
                }
            `}</style>
        </div>
    );
};

export default ProfileDetailsSettings;

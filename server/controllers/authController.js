const User = require('../models/User');
const Address = require('../models/Address');
const Hub = require('../models/Hub');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            let userLocation = user.location;
            
            // Fallback: If location is not set, try to fetch from Address collection
            if (!userLocation || !userLocation.addressLine1) {
                const Address = require('../models/Address');
                const defaultAddress = await Address.findOne({ userId: user._id }).sort({ isDefault: -1, createdAt: -1 });
                
                if (defaultAddress) {
                    userLocation = {
                        addressLine1: defaultAddress.houseNumber + ', ' + defaultAddress.area,
                        city: defaultAddress.townCity,
                        state: defaultAddress.state,
                        country: defaultAddress.country,
                        postalCode: defaultAddress.pincode,
                        latitude: defaultAddress.latitude,
                        longitude: defaultAddress.longitude
                    };
                }
            }

            res.json({
                _id: user._id,
                userId: user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
                location: userLocation,
                avatar: user.avatar,
                region: user.region,
                hub: user.hub,
                isRegionalHub: user.isRegionalHub,
                isBorderHub: user.isBorderHub,
                preferences: user.preferences,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'customer',
            region: req.body.region,
            hub: req.body.hub,
            location: req.body.location
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                userId: user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                region: user.region,
                hub: user.hub,
                isRegionalHub: user.isRegionalHub,
                isBorderHub: user.isBorderHub,
                location: user.location,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (user && (await user.matchPassword(currentPassword))) {
            // Validate password complexity: min 8 chars, 1 uppercase, 1 number
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
            if (!passwordRegex.test(newPassword)) {
                return res.status(400).json({ message: 'Password must be at least 8 characters long, contain at least one uppercase letter and one number.' });
            }

            user.password = newPassword;
            await user.save();

            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(401).json({ message: 'Invalid current password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            await User.deleteOne({ _id: user._id });
            res.json({ message: 'User account deleted successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const findCustomerByEmail = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email, role: 'customer' }).select('name location email region hub nearestWarehouse');
        if (user) {
            const sellerAddr = await Address.findOne({ userId: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
            const customerAddr = await Address.findOne({ userId: user._id }).sort({ isDefault: -1, createdAt: -1 });

            // 1. Resolve Customer Location
            let resolvedLocation = user.location;
            if (!resolvedLocation || !resolvedLocation.latitude) {
                if (customerAddr) {
                    resolvedLocation = {
                        addressLine1: customerAddr.houseNumber + ', ' + customerAddr.area,
                        city: customerAddr.townCity,
                        state: customerAddr.state,
                        country: customerAddr.country,
                        postalCode: customerAddr.pincode,
                        latitude: customerAddr.latitude,
                        longitude: customerAddr.longitude
                    };
                }
            }

            console.log(`Resolving warehouses for Seller: ${req.user.email} and Customer: ${user.email}`);
            console.log(`Seller Hub: ${req.user.hub}, Customer City: ${resolvedLocation?.city}`);

            let sellerWH = null;
            let customerWH = null;

            // 2. Seller Warehouse Logic
            // Priority 1: User Profile nearestWarehouse
            if (req.user.nearestWarehouse) {
                sellerWH = await User.findById(req.user.nearestWarehouse).select('name hub city region role');
            }
            
            // Priority 2: Default Address nearestHub
            if (!sellerWH && sellerAddr?.nearestHub) {
                sellerWH = await User.findById(sellerAddr.nearestHub).select('name hub city region role');
            }

            // Priority 3: Match by attributes, prioritizing 'warehouse' role
            if (!sellerWH) {
                const sellerCriteria = [
                    req.user.hub && { hub: req.user.hub },
                    req.user.city && { city: req.user.city },
                    sellerAddr?.townCity && { city: sellerAddr.townCity },
                    req.user.region && { region: req.user.region }
                ].filter(Boolean);

                if (sellerCriteria.length > 0) {
                    // Try warehouse first
                    sellerWH = await User.findOne({ 
                        role: 'warehouse',
                        $or: sellerCriteria
                    }).select('name hub city region role');

                    // Fallback to manager
                    if (!sellerWH) {
                        sellerWH = await User.findOne({ 
                            role: 'manager',
                            $or: sellerCriteria
                        }).select('name hub city region role');
                    }
                }

                // Absolute fallback (avoid if possible)
                if (!sellerWH) {
                    sellerWH = await User.findOne({ role: 'warehouse', name: /Chennai/i }).select('name hub city region role');
                }
            }

            // 3. Customer Warehouse Logic
            // Priority 1: User Profile nearestWarehouse
            if (user.nearestWarehouse) {
                customerWH = await User.findById(user.nearestWarehouse).select('name hub city region role');
            }

            // Priority 2: Default Address nearestHub
            if (!customerWH && customerAddr?.nearestHub) {
                customerWH = await User.findById(customerAddr.nearestHub).select('name hub city region role');
            }

            // Priority 3: Match by attributes, prioritizing 'warehouse' role
            if (!customerWH) {
                const customerCriteria = [
                    resolvedLocation?.city && { city: resolvedLocation.city },
                    user.hub && { hub: user.hub },
                    customerAddr?.townCity && { city: customerAddr.townCity },
                    user.region && { region: user.region }
                ].filter(Boolean);

                if (customerCriteria.length > 0) {
                    // Try warehouse first
                    customerWH = await User.findOne({ 
                        role: 'warehouse',
                        $or: customerCriteria
                    }).select('name hub city region role');

                    // Fallback to manager
                    if (!customerWH) {
                        customerWH = await User.findOne({ 
                            role: 'manager',
                            $or: customerCriteria
                        }).select('name hub city region role');
                    }
                }

                // Absolute fallback (avoid if possible)
                if (!customerWH) {
                    customerWH = await User.findOne({ role: 'warehouse', name: /Madurai/i }).select('name hub city region role');
                }
            }

            // Final safety fallback if still null - find ANY warehouse
            if (!sellerWH) {
                sellerWH = await User.findOne({ role: 'warehouse' }).select('name hub city region role');
            }
            if (!customerWH) {
                customerWH = await User.findOne({ role: 'warehouse' }).select('name hub city region role');
            }

            console.log(`Resolved - Seller WH: ${sellerWH?.name}, Customer WH: ${customerWH?.name}`);
            
            // 4. Resolve Intermediate Hubs from Mesh Network
            let intermediateHubs = [];
            if (sellerWH && customerWH) {
                // Determine regional hubs for pathfinding (e.g. if WH is in "Salem", its regional hub is "Coimbatore")
                // For simplicity, we use the 'hub' attribute which stores the city name
                const startCity = sellerWH.hub || sellerWH.city;
                const endCity = customerWH.hub || customerWH.city;

                // Find the Hub configuration for the starting regional center
                // Note: local warehouses belong to a regional hub. 
                // We find which regional hub manages this area.
                const startRegionalHub = await Hub.findOne({ region: sellerWH.region, isRegionalCenter: true });
                const endRegionalHub = await Hub.findOne({ region: customerWH.region, isRegionalCenter: true });

                if (startRegionalHub && endRegionalHub && startRegionalHub.name !== endRegionalHub.name) {
                    const routeInfo = startRegionalHub.routes.find(r => r.destination === endRegionalHub.name);
                    
                    if (routeInfo && routeInfo.stops.length > 0) {
                        // Find the User objects (Managers) for these intermediate stops
                        const stopNames = routeInfo.stops;
                        const managers = await User.find({ 
                            city: { $in: stopNames }, 
                            role: 'manager' 
                        }).select('name hub city region role');
                        
                        // Maintain route order
                        intermediateHubs = stopNames.map(name => 
                            managers.find(m => m.city.toLowerCase() === name.toLowerCase())
                        ).filter(Boolean);
                    }
                }
            }

            res.json({
                ...user.toObject(),
                location: resolvedLocation,
                nearestWarehouse: customerWH,
                sellerWarehouse: sellerWH,
                intermediateHubs: intermediateHubs
            });
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        console.error('FindCustomer Error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getAllUsers = async (req, res) => {
    console.log(`GET /api/auth/users called by ${req.user?.email} (${req.user?.role})`);
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        res.status(500).json({ message: error.message });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        
        // Block managers from assigning cargo_driver role
        if (role === 'cargo_driver' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Only admins can assign Cargo Driver roles.' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Role Enforcement Group
        const manageableRoles = req.user.role === 'admin' 
            ? ['customer', 'delivery_driver', 'cargo_driver', 'driver'] 
            : ['customer', 'delivery_driver', 'driver'];
            
        const targetableRoles = ['customer', 'delivery_driver'];

        // Restriction: Non-admins have limited target roles and manageable users
        if (req.user.role !== 'admin') {
            if (!targetableRoles.includes(role)) {
                return res.status(403).json({ message: `Access denied: Managers cannot assign the ${role} role.` });
            }
            if (!manageableRoles.includes(user.role)) {
                return res.status(403).json({ message: `Access denied: Managers cannot modify ${user.role.replace('_', ' ')} roles.` });
            }
        }

        user.role = role || user.role;
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get all warehouse users
// @route   GET /api/auth/warehouses
// @access  Public (or semi-public)
const getWarehouses = async (req, res) => {
    try {
        const warehouses = await User.find({ role: { $in: ['warehouse', 'manager'] } }).select('name _id city region hub role');
        res.json(warehouses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { loginUser, registerUser, changePassword, deleteAccount, findCustomerByEmail, getAllUsers, updateUserRole, getWarehouses };

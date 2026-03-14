const Parcel = require('../models/Parcel');
const User = require('../models/User');
const Address = require('../models/Address');

const Hub = require('../models/Hub');

// @desc    Create a new parcel
// @route   POST /api/parcels
// @access  Private (Parcel Receiver)
const createParcel = async (req, res) => {
    try {
        let { customer, customerName, deliveryAddress, destination } = req.body;
        
        // 1. Find Full Profiles
        const sellerProfile = await User.findById(req.user._id);
        if (!sellerProfile) {
            return res.status(404).json({ message: 'Seller profile not found' });
        }
        const customerProfile = await User.findById(customer);
        
        if (!customerProfile) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Safety fallback for destination
        if (!destination) {
            destination = customerProfile.location?.city || customerProfile.city || 'Chennai';
            req.body.destination = destination;
        }

        // 2. Determine Warehouses (Manual Specification Prioritized)
        const sellerAddr = await Address.findOne({ userId: sellerProfile._id }).sort({ isDefault: -1, createdAt: -1 });
        const customerAddr = await Address.findOne({ userId: customerProfile._id }).sort({ isDefault: -1, createdAt: -1 });

        let originWH = null;
        let destWH = null;

        // Resolve Origin Hub
        // Priority 1: Profile nearestWarehouse
        if (sellerProfile.nearestWarehouse) {
            originWH = await User.findById(sellerProfile.nearestWarehouse);
        }
        
        // Priority 2: Address nearestHub
        if (!originWH && sellerAddr?.nearestHub) {
            const manualHub = await User.findById(sellerAddr.nearestHub);
            if (manualHub) {
                originWH = manualHub.role === 'warehouse' ? manualHub : await User.findOne({ role: 'warehouse', hub: manualHub.hub });
            }
        }
        
        // Priority 3: Match by attributes
        if (!originWH) {
            const criteria = [
                sellerProfile?.hub && { hub: sellerProfile.hub },
                sellerProfile?.city && { city: sellerProfile.city },
                sellerAddr?.townCity && { city: sellerAddr.townCity }
            ].filter(Boolean);

            if (criteria.length > 0) {
                originWH = await User.findOne({ 
                    role: 'warehouse', 
                    $or: criteria
                }).sort({ createdAt: 1 });
            }

            // Fallback
            if (!originWH) {
                originWH = await User.findOne({ role: 'warehouse', name: /Chennai/i });
            }
        }

        // Resolve Destination Hub
        // Priority 1: Profile nearestWarehouse
        if (customerProfile.nearestWarehouse) {
            destWH = await User.findById(customerProfile.nearestWarehouse);
        }

        // Priority 2: Address nearestHub
        if (!destWH && customerAddr?.nearestHub) {
            const manualHub = await User.findById(customerAddr.nearestHub);
            if (manualHub) {
                destWH = manualHub.role === 'warehouse' ? manualHub : await User.findOne({ role: 'warehouse', hub: manualHub.hub });
            }
        }

        // Priority 3: Match by attributes
        if (!destWH) {
            const criteria = [
                { city: destination },
                customerProfile.hub && { hub: customerProfile.hub },
                customerProfile.location?.city && { city: customerProfile.location.city },
                customerAddr?.townCity && { city: customerAddr.townCity }
            ].filter(Boolean);

            if (criteria.length > 0) {
                destWH = await User.findOne({ 
                    role: 'warehouse', 
                    $or: criteria
                }).sort({ createdAt: 1 });
            }

            // Fallback
            if (!destWH) {
                destWH = await User.findOne({ role: 'warehouse', name: /Madurai/i });
            }
        }

        if (!originWH) {
            return res.status(400).json({ message: 'No suitable origin warehouse found. Please set your hub in profile.' });
        }
        if (!destWH) {
            return res.status(400).json({ message: 'No suitable destination warehouse found for this customer.' });
        }

        const originWarehouse = originWH;
        const destinationWarehouse = destWH;

        // 3. Automated Hub Routing via Mesh Network
        let intermediateHubs = [];
        if (originWarehouse.region && destinationWarehouse.region && originWarehouse.region !== destinationWarehouse.region) {
            const startRegionalHub = await Hub.findOne({ region: originWarehouse.region, isRegionalCenter: true });
            const endRegionalHub = await Hub.findOne({ region: destinationWarehouse.region, isRegionalCenter: true });

            if (startRegionalHub && endRegionalHub && startRegionalHub.name !== endRegionalHub.name) {
                const routeInfo = startRegionalHub.routes.find(r => r.destination === endRegionalHub.name);
                
                if (routeInfo && routeInfo.stops.length > 0) {
                    const stopNames = routeInfo.stops;
                    const managers = await User.find({ 
                        city: { $in: stopNames }, 
                        role: { $in: ['manager', 'warehouse'] } 
                    });
                    
                    // Maintain route order and get their ID's
                    intermediateHubs = stopNames.map(name => {
                        const match = managers.find(m => m.city.toLowerCase() === name.toLowerCase());
                        return match ? match._id : null;
                    }).filter(Boolean);
                }
            }
        }

        console.log('--- Parcel Creation Debug ---');
        console.log('Customer ID from body:', customer);
        console.log('Resolved Customer Profile ID:', customerProfile?._id);
        console.log('Resolved Seller Profile ID:', sellerProfile?._id);
        console.log('Origin Warehouse ID:', originWarehouse?._id);
        console.log('Destination Warehouse ID:', destinationWarehouse?._id);

        const parcelId = req.body.parcelId || `PRC-${Math.floor(10000 + Math.random() * 90000)}`;

        const newParcelData = {
            parcelId,
            productName: req.body.productName || 'Manual Item',
            category: req.body.category || 'General',
            weight: req.body.weight || '1kg',
            seller: sellerProfile.name,
            customer: customerProfile._id,
            customerName: req.body.customerName || customerProfile.name,
            deliveryAddress: req.body.deliveryAddress || customerProfile.location?.addressLine1 || 'No Address',
            destination,
            origin: originWarehouse.name,
            originWarehouse: originWarehouse._id,
            destinationWarehouse: destinationWarehouse._id,
            intermediateHubs: intermediateHubs,
            currentWarehouse: originWarehouse._id,
            deliveryType: req.body.deliveryType || 'Standard',
            status: req.body.status || 'Dispatched'
        };

        console.log('Instantiating Parcel with data:', JSON.stringify({ ...newParcelData, customer: newParcelData.customer.toString() }, null, 2));

        const newParcel = new Parcel(newParcelData);

        const savedParcel = await newParcel.save();
        console.log(`Parcel created successfully: ${parcelId}`);
        res.status(201).json(savedParcel);
    } catch (err) {
        console.error('CRITICAL: Error in createParcel:', err);
        res.status(500).json({ message: err.message, stack: err.stack });
    }
};

// @desc    Get all parcels
// @route   GET /api/parcels
// @access  Private
const getParcels = async (req, res) => {
    try {
        let query = {};
        
        // If user is a seller, only show their own parcels
        if (req.user && req.user.role === 'seller') {
            query.seller = req.user.name;
        }

        const parcels = await Parcel.find(query)
            .populate('originWarehouse', 'name city region')
            .populate('destinationWarehouse', 'name city region')
            .populate('intermediateHubs', 'name city region')
            .sort({ createdAt: -1 });
        res.status(200).json(parcels);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Get parcel by ID
// @route   GET /api/parcels/:id
// @access  Private
const getParcelById = async (req, res) => {
    try {
        const parcel = await Parcel.findById(req.params.id);
        if (parcel) {
            res.json(parcel);
        } else {
            res.status(404).json({ message: 'Parcel not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Update parcel
// @route   PUT /api/parcels/:id
// @access  Private
const updateParcel = async (req, res) => {
    try {
        const parcel = await Parcel.findById(req.params.id);
        if (parcel) {
            const updatedParcel = await Parcel.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.json(updatedParcel);
        } else {
            res.status(404).json({ message: 'Parcel not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Delete parcel
// @route   DELETE /api/parcels/:id
// @access  Private
const deleteParcel = async (req, res) => {
    try {
        const parcel = await Parcel.findById(req.params.id);
        if (parcel) {
            await Parcel.findByIdAndDelete(req.params.id);
            res.json({ message: 'Parcel removed' });
        } else {
            res.status(404).json({ message: 'Parcel not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Mark parcel as delivered via scan
// @route   PUT /api/parcels/scan/:parcelId
// @access  Private
const markParcelDelivered = async (req, res) => {
    try {
        const { parcelId } = req.params;
        const parcel = await Parcel.findOne({ parcelId });
        
        if (parcel) {
            parcel.status = 'Delivered';
            await parcel.save();
            res.json({ message: 'Parcel marked as delivered successfully', parcel });
        } else {
            res.status(404).json({ message: 'Parcel not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createParcel, getParcels, getParcelById, updateParcel, deleteParcel, markParcelDelivered };
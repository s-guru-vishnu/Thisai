const { GoogleGenerativeAI } = require("@google/generative-ai");
const Parcel = require("../models/Parcel");
const User = require("../models/User");
const { calculateDelayInternal } = require("../services/predictionService");

const explainLogistics = async (req, res) => {
    try {
        const { message } = req.body;
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        // Gather data context to make it "explainable"
        const userId = req.user?._id;
        const role = req.user?.role;
        
        let systemContext = `
            You are "Thisai AI", a logistics and supply chain expert for Tamil Nadu. 
            You explain the system's decisions to ${role}s.
            
            Our Key Algorithms:
            1. Fair Burden Distribution: We avoid driver burnout using Fairness Score (FS).
               FS = 0.7 * (Active Workload) + 0.3 * (Historical Burden Ratio).
               Lower FS means the driver is more available.
            2. Mesh Routing: We route parcels through regional hubs (Chennai, Coimbatore, Madurai, Trichy, Tirunelveli).
            
            User Role: ${role}
            Current User ID: ${userId}
        `;

        // If the user asks about a specific parcel, we can fetch it
        const parcelMatch = message.match(/PRC-\d+/i) || message.match(/M-[0-9A-Z]+/i);
        if (parcelMatch) {
            const parcel = await Parcel.findOne({ 
                $or: [
                    { parcelId: parcelMatch[0].toUpperCase() },
                    { trackingCode: parcelMatch[0].toUpperCase() }
                ]
            });
            if (parcel) {
                const prediction = await calculateDelayInternal(parcel);
                systemContext += `\nContext on Parcel ${parcel.parcelId || parcel.trackingCode}: 
                Status: ${parcel.status}, 
                Driver Assigned: ${parcel.assignedDriver || 'None'},
                Origin: ${parcel.origin || 'N/A'},
                Destination: ${parcel.destination},
                Current Prediction: 
                - ETA: ${prediction.eta}
                - Delay: ${prediction.delayMinutes} mins
                - Risk Level: ${prediction.delayRisk}
                - Analysis Reason: ${prediction.reason}`;
            }
        }

        const prompt = `${systemContext}\n\nUser Question: ${message}\n\nProvide a professional, helpful, and concise response in plain text:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const reply = response.text();

        res.json({ reply });
    } catch (error) {
        console.error("CRITICAL Gemini AI Error:", error.message);
        res.status(500).json({ 
            message: "AI Engine error", 
            error: error.message 
        });
    }
};

module.exports = { explainLogistics };

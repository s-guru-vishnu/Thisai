const { GoogleGenerativeAI } = require("@google/generative-ai");
const Parcel = require("../models/Parcel");
const User = require("../models/User");

const explainLogistics = async (req, res) => {
    try {
        const { message, context } = req.body;
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Gather some data context to make it "explainable"
        const userId = req.user._id;
        const role = req.user.role;
        
        let systemContext = `
            You are "Thisai AI", a logistics and supply chain expert. 
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
        const parcelMatch = message.match(/PRC-\d+/i);
        if (parcelMatch) {
            const parcel = await Parcel.findOne({ parcelId: parcelMatch[0].toUpperCase() });
            if (parcel) {
                systemContext += `\nContext on Parcel ${parcel.parcelId}: 
                Status: ${parcel.status}, 
                Driver Assigned: ${parcel.assignedDriver || 'None'},
                Origin: ${parcel.origin},
                Destination: ${parcel.destination}`;
            }
        }

        const prompt = `${systemContext}\n\nUser Question: ${message}\nAI Explanation:`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("CRITICAL Gemini AI Error:", error.message);
        if (error.response) {
            console.error("Gemini Response Error:", error.response.data);
        }
        res.status(500).json({ 
            message: "AI Engine error", 
            error: error.message 
        });
    }
};

module.exports = { explainLogistics };

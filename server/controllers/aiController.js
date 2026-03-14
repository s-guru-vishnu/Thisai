const axios = require("axios");
const Parcel = require("../models/Parcel");
const User = require("../models/User");
const { calculateDelayInternal } = require("../services/predictionService");

const explainLogistics = async (req, res) => {
    try {
        const { message } = req.body;
        const webhookUrl = process.env.N8N_WEBHOOK_URL;

        if (!webhookUrl) {
            throw new Error("N8N_WEBHOOK_URL is not defined in environment variables");
        }

        // Gather some data context to make it "explainable"
        const userId = req.user?._id;
        const role = req.user?.role;
        
        let contextData = {
            role,
            userId,
            algorithms: {
                fairBurdenDistribution: "FS = 0.7 * (Workload) + 0.3 * (History)",
                meshRouting: ["Chennai", "Coimbatore", "Madurai", "Trichy", "Tirunelveli"]
            },
            parcelInfo: null
        };

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
                contextData.parcelInfo = {
                    parcelId: parcel.parcelId || parcel.trackingCode,
                    status: parcel.status,
                    driver: parcel.assignedDriver || 'None',
                    origin: parcel.origin || 'N/A',
                    destination: parcel.destination,
                    prediction: {
                        eta: prediction.eta,
                        delayMinutes: prediction.delayMinutes,
                        riskLevel: prediction.delayRisk,
                        reason: prediction.reason
                    }
                };
            }
        }

        // Trigger n8n Webhook
        const response = await axios.post(webhookUrl, {
            message,
            context: contextData,
            timestamp: new Date().toISOString()
        });

        // n8n should return { reply: "..." } or similar
        console.log("n8n Webhook Success. Data received:", response.data);

        let reply = "I'm processing your request via n8n...";
        
        if (typeof response.data === 'string') {
            reply = response.data;
        } else if (response.data) {
            reply = response.data.reply || 
                    response.data.output || 
                    response.data.message || 
                    response.data.text ||
                    (typeof response.data === 'object' ? JSON.stringify(response.data) : String(response.data));
        }

        res.json({ reply });
    } catch (error) {
        if (error.response) {
            console.error("n8n Webhook Error Response:", {
                status: error.response.status,
                data: error.response.data
            });
        }
        console.error("CRITICAL n8n Webhook Error:", error.message);
        res.status(500).json({ 
            message: "AI Workflow error", 
            error: error.message 
        });
    }
};

module.exports = { explainLogistics };

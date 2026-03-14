# Thisai: Premium Logistics & Supply Chain Control 🚚💨

Thisai (Tamil for "Direction") is a state-of-the-art, end-to-end logistics management platform designed for regional distribution networks. It features a high-performance mesh routing architecture, fair driver workload distribution, and explainable AI insights.

---

## ✨ Core Features

### 🏢 Multi-Role Ecosystem
- **System Admin**: Global oversight, network statistics, and high-level monitoring.
- **Regional Manager**: Team management, automatic delivery assignment, and local hub control.
- **Dispatcher/Warehouse**: Manual parcel entry, QR code generation, and physical inventory intake.
- **Delivery Driver**: Real-time route navigation, live GPS tracking, and delivery confirmation via scanning.
- **Customer**: Live "Uber-like" tracking map, weather-aware ETA predictions, and delivery history.

### 🧠 Intelligent Logistics Engine
- **Fair Burden Distribution (FBD)**: An AI-driven assignment algorithm that calculates a `Fairness Score (FS)` for drivers based on current workload and historical burden, preventing burnout.
- **Mesh Routing Architecture**: Automated pathing through regional hubs (Chennai, Coimbatore, Madurai, etc.) to optimize long-distance transit.
- **Explainable AI (XAI)**: A built-in "Thisai AI Expert" chatbot powered by an **n8n Webhook Workflow** that explains routing decisions, delays, and logistics logic to users in real-time.
- **Predictive Delay Updates**: Real-time evaluation of weather conditions (OpenWeather integration) and traffic patterns to provide customers with accurate ETAs.

---

## 🛠️ Tech Stack

### Backend
- **Core**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **AI**: n8n Webhook Integration
- **APIs**: OpenWeatherMap (Weather risk)
- **Security**: JWT Authentication, Role-Based Access Control (RBAC), Bcrypt password hashing.

### Frontend
- **Core**: React.js (Vite)
- **Styling**: Vanilla CSS (Premium Dark Mode, Glassmorphism)
- **Mapping**: Google Maps JavaScript API (@react-google-maps/api)
- **Icons**: Lucide-react
- **Scanning**: Html5-qrcode

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or Atlas)
- API Keys: 
  - Google Maps API Key
  - n8n Webhook URL
  - OpenWeatherMap API Key

### 2. Installation

#### Clone the repository
```bash
git clone https://github.com/s-guru-vishnu/Thisai.git
cd Thisai
```

#### Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=5005
MONGO_URI=mongodb://127.0.0.1:27017/thisai_db
JWT_SECRET=your_jwt_secret
WEATHER_API_KEY=your_openweather_key
```

#### Frontend Setup
```bash
cd client
npm install
```
Create a `.env` file in the `client` directory:
```env
VITE_API_BASE_URL=http://localhost:5005
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### 3. Running the App
**Start Backend:**
```bash
cd server
npm start
```

**Start Frontend:**
```bash
cd client
npm run dev
```

---

## 🗺️ Database Seeding
To populate the network with regional hubs and managers:
```bash
cd server
node scripts/seedManagers.js
node scripts/seedHubs.js
```

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.

---
*Built with ❤️ by the Thisai Logistics Team.*

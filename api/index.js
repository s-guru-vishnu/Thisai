const app = require('../server/server');

// Vercel serverless handler with explicit CORS preflight support
module.exports = (req, res) => {
    // Determine allowed origin
    const origin = req.headers.origin;
    const allowed = [
        'https://thisai-logistics.vercel.app',
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:5005',
    ];
    const isAllowed = !origin || allowed.includes(origin) || /\.vercel\.app$/.test(origin);
    const allowOrigin = isAllowed ? (origin || '*') : '';

    // Handle CORS preflight (OPTIONS) directly — never let it redirect
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', allowOrigin);
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Max-Age', '86400');
        return res.status(200).end();
    }

    // For all other methods, pass through to Express
    return app(req, res);
};

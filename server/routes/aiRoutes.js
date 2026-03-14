const express = require('express');
const router = express.Router();
const { explainLogistics } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/chat', protect, explainLogistics);

module.exports = router;

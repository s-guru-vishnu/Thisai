const express = require('express');
const router = express.Router();
const { getPath } = require('../controllers/logisticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/path', protect, getPath);

module.exports = router;

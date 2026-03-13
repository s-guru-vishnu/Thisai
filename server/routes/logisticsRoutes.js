const express = require('express');
const router = express.Router();
const { getPath, getHubs } = require('../controllers/logisticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/path', protect, getPath);
router.get('/hubs', protect, getHubs);

module.exports = router;

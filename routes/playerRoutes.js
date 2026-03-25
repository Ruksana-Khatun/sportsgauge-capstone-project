const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/playerController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Protected Routes — token chahiye
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;
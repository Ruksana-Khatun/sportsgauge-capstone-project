const express = require('express');
const router = express.Router();
const {getProfile } = require('../controllers/playerController');
const {updateProfile } = require('../controllers/playerController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/profile',  authMiddleware, getProfile);
router.put('/profile',  authMiddleware, updateProfile);
module.exports = router;
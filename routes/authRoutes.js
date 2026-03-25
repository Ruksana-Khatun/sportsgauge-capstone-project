const express = require('express');
const router = express.Router();
const { registerPlayer, loginPlayer, loginAdmin } = require('../controllers/authController');

// Player Routes
router.post('/register', registerPlayer);
router.post('/login', loginPlayer);

// Admin Routes
router.post('/admin/login', loginAdmin);

module.exports = router;
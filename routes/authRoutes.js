 const express = require('express');
const router = express.Router();

// ✅ Exact same naam jo controller mein export kiye hain
const { registerPlayer, loginPlayer, loginAdmin } = require('../controllers/authController');

router.post('/register',     registerPlayer);
router.post('/login',        loginPlayer);
router.post('/admin/login',  loginAdmin);

module.exports = router;
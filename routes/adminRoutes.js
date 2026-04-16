const express = require('express');
const router = express.Router();
const { getAllSubmissions, reviewSubmission, getDashboardStats, getAllPlayers } = require('../controllers/adminController');
const { adminMiddleware } = require('../middleware/authMiddleware');

router.get('/submissions', adminMiddleware, getAllSubmissions);
router.put('/submissions/:id/review', adminMiddleware, reviewSubmission);
router.get('/stats', adminMiddleware, getDashboardStats);
router.get('/players', adminMiddleware, getAllPlayers);

module.exports = router;
const express = require('express');
const router = express.Router();
const { analyzeVideo, getAiResult } = require('../controllers/aiController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.post('/analyze', adminMiddleware, analyzeVideo);
router.get('/result/:submissionId', authMiddleware, getAiResult);

module.exports = router;
const express = require('express');
const router = express.Router();
const { uploadDocuments, getDocuments } = require('../controllers/documentController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/upload', authMiddleware, uploadDocuments);
router.get('/:userId', authMiddleware, getDocuments);

module.exports = router;
const express = require('express');
const router = express.Router();
const { uploadSubmission, getSubmissionsByUser } = require('../controllers/submissionController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/upload', authMiddleware, uploadSubmission);
router.get('/:userId', authMiddleware, getSubmissionsByUser);

module.exports = router;
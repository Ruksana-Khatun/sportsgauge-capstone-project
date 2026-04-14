const express = require('express');
const router = express.Router();
const { getAllTests, getTestById, createTest, updateTest, deleteTest } = require('../controllers/testController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Public + Player Routes
router.get('/', authMiddleware, getAllTests);
router.get('/:id', authMiddleware, getTestById);

// Admin Only Routes
router.post('/', adminMiddleware, createTest);
router.put('/:id', adminMiddleware, updateTest);
router.delete('/:id', adminMiddleware, deleteTest);

module.exports = router;
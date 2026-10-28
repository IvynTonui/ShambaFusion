const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/admin.middleware');
const { authenticateToken } = require('../middleware/auth.middleware');
const { getSystemMetrics } = require('../controllers/system.controller');

// Get system metrics - protected route for admins only
router.get('/metrics', authenticateToken, requireAdmin, getSystemMetrics);

module.exports = router;
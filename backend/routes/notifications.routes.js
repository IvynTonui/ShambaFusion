const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const {
    getUserNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    getUnreadCount,
    deleteNotification
} = require('../controllers/notifications.controller');

// All routes require authentication
router.use(authenticateToken);

// Get all notifications for the authenticated user
router.get('/', getUserNotifications);

// Mark a notification as read
router.put('/:id/read', markNotificationRead);

// Mark all notifications as read
router.put('/read-all', markAllNotificationsRead);

// Get unread notification count
router.get('/unread-count', getUnreadCount);

// Delete a notification
router.delete('/:id', deleteNotification);

module.exports = router;
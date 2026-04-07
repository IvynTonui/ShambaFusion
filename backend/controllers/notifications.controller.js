const db = require('../config/db.config');

// Get all notifications for a user
const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [notifications] = await db.query(`
      SELECT 
        notification_id, 
        type, 
        message, 
        related_id, 
        is_read, 
        created_at
      FROM Notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [userId]);

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            message: 'Error fetching notifications',
            error: error.message
        });
    }
};

// Mark notification as read
const markNotificationRead = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user.userId;

        // Verify the notification belongs to the user
        const [notification] = await db.query(
            'SELECT * FROM Notifications WHERE notification_id = ? AND user_id = ?',
            [notificationId, userId]
        );

        if (notification.length === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        await db.query(
            'UPDATE Notifications SET is_read = 1 WHERE notification_id = ?',
            [notificationId]
        );

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({
            message: 'Error updating notification',
            error: error.message
        });
    }
};

// Mark all notifications as read
const markAllNotificationsRead = async (req, res) => {
    try {
        const userId = req.user.userId;

        await db.query(
            'UPDATE Notifications SET is_read = 1 WHERE user_id = ?',
            [userId]
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error updating notifications:', error);
        res.status(500).json({
            message: 'Error updating notifications',
            error: error.message
        });
    }
};

// Get unread notification count
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [result] = await db.query(
            'SELECT COUNT(*) as count FROM Notifications WHERE user_id = ? AND is_read = 0',
            [userId]
        );

        res.json({ count: result[0].count });
    } catch (error) {
        console.error('Error fetching notification count:', error);
        res.status(500).json({
            message: 'Error fetching notification count',
            error: error.message
        });
    }
};

// Create a notification (internal function)
const createNotification = async (userId, type, message, relatedId) => {
    try {
        await db.query(
            'INSERT INTO Notifications (user_id, type, message, related_id, is_read) VALUES (?, ?, ?, ?, 0)',
            [userId, type, message, relatedId]
        );
        return true;
    } catch (error) {
        console.error('Error creating notification:', error);
        return false;
    }
};

// Delete a notification
const deleteNotification = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user.userId;

        // Verify the notification belongs to the user
        const [notification] = await db.query(
            'SELECT * FROM Notifications WHERE notification_id = ? AND user_id = ?',
            [notificationId, userId]
        );

        if (notification.length === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        await db.query('DELETE FROM Notifications WHERE notification_id = ?', [notificationId]);

        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            message: 'Error deleting notification',
            error: error.message
        });
    }
};

module.exports = {
    getUserNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    getUnreadCount,
    createNotification,
    deleteNotification
};
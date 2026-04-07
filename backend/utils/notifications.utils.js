const db = require('../config/db.config');
const { createNotification } = require('../controllers/notifications.controller');

// Utility to notify a post author about a new comment
const notifyCommentAdded = async (postId, commentId, commentAuthorId) => {
    try {
        // Get post details to find the post author
        const [posts] = await db.query('SELECT user_id, title FROM Posts WHERE post_id = ?', [postId]);

        if (posts.length === 0) {
            console.error('Post not found for notification:', postId);
            return false;
        }

        const postAuthorId = posts[0].user_id;
        const postTitle = posts[0].title;

        // Don't notify if the comment author is the same as the post author
        if (postAuthorId === commentAuthorId) {
            return true;
        }

        // Get comment author name
        const [users] = await db.query('SELECT name FROM Users WHERE user_id = ?', [commentAuthorId]);
        const commentAuthorName = users.length > 0 ? users[0].name : 'Someone';

        // Create notification
        const message = `${commentAuthorName} commented on your post: "${postTitle.substring(0, 30)}${postTitle.length > 30 ? '...' : ''}"`;

        return await createNotification(
            postAuthorId,
            'comment',
            message,
            postId
        );
    } catch (error) {
        console.error('Error creating comment notification:', error);
        return false;
    }
};

// Utility to notify users about a new resource
const notifyResourceAdded = async (resourceId, resourceName, resourceAuthorId) => {
    try {
        // Get all active users except the author
        const [users] = await db.query(
            'SELECT user_id FROM Users WHERE user_id != ?',
            [resourceAuthorId]
        );

        // Get resource author name
        const [authors] = await db.query('SELECT name FROM Users WHERE user_id = ?', [resourceAuthorId]);
        const authorName = authors.length > 0 ? authors[0].name : 'Someone';

        // Create message
        const message = `${authorName} added a new resource: "${resourceName}"`;

        // Create notification for each user
        const notifications = users.map(async (user) => {
            return await createNotification(
                user.user_id,
                'resource',
                message,
                resourceId
            );
        });

        await Promise.all(notifications);
        return true;
    } catch (error) {
        console.error('Error creating resource notification:', error);
        return false;
    }
};
// Utility to notify a post author about a like
const notifyPostLiked = async (postId, likeAuthorId) => {
    try {
        // Get post details to find the post author
        const [posts] = await db.query('SELECT user_id, title FROM Posts WHERE post_id = ?', [postId]);

        if (posts.length === 0) {
            console.error('Post not found for notification:', postId);
            return false;
        }

        const postAuthorId = posts[0].user_id;
        const postTitle = posts[0].title;

        // Don't notify if the like author is the same as the post author
        if (postAuthorId === likeAuthorId) {
            return true;
        }

        // Get like author name
        const [users] = await db.query('SELECT name FROM Users WHERE user_id = ?', [likeAuthorId]);
        const likeAuthorName = users.length > 0 ? users[0].name : 'Someone';

        // Create notification
        const message = `${likeAuthorName} liked your post: "${postTitle.substring(0, 30)}${postTitle.length > 30 ? '...' : ''}"`;

        return await createNotification(
            postAuthorId,
            'like',
            message,
            postId
        );
    } catch (error) {
        console.error('Error creating like notification:', error);
        return false;
    }
};


module.exports = {
    notifyCommentAdded,
    notifyResourceAdded,
    notifyPostLiked
};
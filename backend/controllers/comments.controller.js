const db = require('../config/db.config');
const { notifyCommentAdded } = require('../utils/notifications.utils');

// Get all comments for a post
const getPostComments = async (req, res) => {
    try {
        const [comments] = await db.query(`
            SELECT Comments.*, Users.name as author_name
            FROM Comments
            LEFT JOIN Users ON Comments.user_id = Users.user_id
            WHERE Comments.post_id = ?
            ORDER BY Comments.created_at DESC
        `, [req.params.postId]);

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comments', error: error.message });
    }
};

// Get single comment
const getCommentById = async (req, res) => {
    try {
        const [comments] = await db.query(`
            SELECT Comments.*, Users.name as author_name
            FROM Comments
            LEFT JOIN Users ON Comments.user_id = Users.user_id
            WHERE Comments.comment_id = ?
        `, [req.params.id]);

        if (comments.length === 0) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        res.json(comments[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comment', error: error.message });
    }
};

// Create comment
const createComment = async (req, res) => {
    try {
        console.log("🔍 Received request body:", req.body);
        console.log("🔍 Authenticated user:", req.user);

        const { post_id, comment } = req.body;

        // Validate request data
        if (!post_id || !comment) {
            console.error("🚨 Missing post_id or comment");
            return res.status(400).json({ message: "Post ID and comment are required" });
        }

        const user_id = req.user?.userId; // Ensure userId is present
        if (!user_id) {
            console.error("🚨 Unauthorized: Missing user ID");
            return res.status(401).json({ message: "Unauthorized: No user ID" });
        }

        // Verify post exists
        const [posts] = await db.query("SELECT * FROM Posts WHERE post_id = ?", [post_id]);
        if (posts.length === 0) {
            console.error("🚨 Post not found");
            return res.status(404).json({ message: "Post not found" });
        }

        // Insert comment into DB
        const [result] = await db.query(
            "INSERT INTO Comments (post_id, user_id, comment) VALUES (?, ?, ?)",
            [post_id, user_id, comment]
        );
        // After successfully creating the comment
        await notifyCommentAdded(post_id, result.insertId, user_id);

        console.log("✅ Comment created with ID:", result.insertId);
        res.status(201).json({
            message: "Comment created successfully",
            comment_id: result.insertId
        });
    } catch (error) {
        console.error("❌ Error creating comment:", error);
        res.status(500).json({ message: "Error creating comment", error: error.message });
    }
};


// Update comment
const updateComment = async (req, res) => {
    try {
        const { comment } = req.body;
        const commentId = req.params.id;
        const userId = req.user.userId;

        const [result] = await db.query(
            'UPDATE Comments SET comment = ? WHERE comment_id = ? AND user_id = ?',
            [comment, commentId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Comment not found or unauthorized' });
        }

        res.json({ message: 'Comment updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating comment', error: error.message });
    }
};

// Delete comment
const deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.user.userId;
        const userRole = req.user.role;

        // Allow admins to delete any comment, users can only delete their own
        let query = 'DELETE FROM Comments WHERE comment_id = ?';
        let params = [commentId];

        if (userRole !== 'admin') {
            query += ' AND user_id = ?';
            params.push(userId);
        }

        const [result] = await db.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Comment not found or unauthorized' });
        }

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting comment', error: error.message });
    }
};
// Get comment count for a post
const getCommentCount = async (req, res) => {
    try {
        const postId = req.params.postId;

        const [result] = await db.query(
            'SELECT COUNT(*) as count FROM Comments WHERE post_id = ?',
            [postId]
        );

        res.json({ count: result[0].count });
    } catch (error) {
        console.error('Error fetching comment count:', error);
        res.status(500).json({
            message: 'Error fetching comment count',
            error: error.message
        });
    }
};

module.exports = {
    getPostComments,
    getCommentById,
    createComment,
    updateComment,
    deleteComment,
    getCommentCount
};
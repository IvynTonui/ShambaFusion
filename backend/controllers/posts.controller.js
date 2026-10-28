const db = require('../config/db.config');
const { notifyPostLiked } = require('../utils/notifications.utils');

// Get all posts
const getAllPosts = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
        const offset = (page - 1) * limit;

        // Get total count for pagination
        const [countResult] = await db.query('SELECT COUNT(*) as total FROM Posts');
        const totalPosts = countResult[0].total;

        const [posts] = await db.query(`
            SELECT
                Posts.*,
                Users.name as author_name,
                Categories.name as category_name,
                (SELECT COUNT(*) FROM Comments WHERE Comments.post_id = Posts.post_id) as comment_count,
                COALESCE(Posts.likes, 0) as like_count
            FROM Posts
                     LEFT JOIN Users ON Posts.user_id = Users.user_id
                     LEFT JOIN Categories ON Posts.category_id = Categories.category_id
            ORDER BY Posts.created_at DESC, Posts.post_id DESC
                LIMIT ? OFFSET ?
        `, [limit, offset]);

        res.json({
            posts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalPosts / limit),
                totalPosts,
                postsPerPage: limit
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts' });
    }
};

// Get single post
const getPostById = async (req, res) => {
    try {
        const [posts] = await db.query(`
            SELECT
                Posts.*,
                Users.name as author_name,
                Categories.name as category_name,
                (SELECT COUNT(*) FROM Comments WHERE Comments.post_id = Posts.post_id) as comment_count,
                COALESCE(Posts.likes, 0) as like_count
            FROM Posts
                     LEFT JOIN Users ON Posts.user_id = Users.user_id
                     LEFT JOIN Categories ON Posts.category_id = Categories.category_id
            WHERE Posts.post_id = ?
        `, [req.params.id]);

        if (posts.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(posts[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching post' });
    }
};
// Create post
const createPost = async (req, res) => {

    try {
        const { title, content, category_id } = req.body;
        const user_id = req.user.userId; // From auth middleware


        // Validate input
        if (!title || !content || !category_id) {
            return res.status(400).json({ message: "Title, content, and category are required" });
        }

        // Check if category exists
        const [categoryCheck] = await db.query("SELECT * FROM Categories WHERE category_id = ?", [category_id]);
        if (categoryCheck.length === 0) {
            return res.status(400).json({ message: "Invalid category ID" });
        }

        // Insert post
        const [result] = await db.query(
            "INSERT INTO Posts (title, content, user_id, category_id) VALUES (?, ?, ?, ?)",
            [title, content, user_id, category_id]
        );

        res.status(201).json({
            message: "Post created successfully",
            post_id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating post" });
    }
};

// Update post
const updatePost = async (req, res) => {
    try {
        const { title, content, category_id } = req.body;
        const postId = req.params.id;
        const userId = req.user.userId;

        if (!title || !content || !category_id) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const [post] = await db.query("SELECT * FROM Posts WHERE post_id = ?", [postId]);
        if (post.length === 0) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post[0].user_id !== userId) {
            return res.status(403).json({ message: "Unauthorized to update this post" });
        }

        await db.query(
            "UPDATE Posts SET title = ?, content = ?, category_id = ? WHERE post_id = ?",
            [title, content, category_id, postId]
        );

        res.json({ message: "Post updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating post" });
    }
};

// Delete post with admin privileges
const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.userId;
        const isAdmin = req.user.role === 'admin'; // Get admin status from user object

        // Find the post
        const [post] = await db.query("SELECT * FROM Posts WHERE post_id = ?", [postId]);
        if (post.length === 0) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if user is post owner OR an admin
        if (post[0].user_id !== userId && !isAdmin) {
            return res.status(403).json({ message: "Unauthorized to delete this post" });
        }

        // Proceed with deletion
        await db.query("DELETE FROM Posts WHERE post_id = ?", [postId]);
        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ message: "Error deleting post" });
    }
};

// Like a post
// Like a post
const likePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.userId;

        // Check if the user already liked this post
        const [existingLike] = await db.query(
            "SELECT * FROM PostLikes WHERE post_id = ? AND user_id = ?",
            [postId, userId]
        );

        if (existingLike.length > 0) {
            return res.status(400).json({ message: "You have already liked this post" });
        }

        // Insert the like
        await db.query(
            "INSERT INTO PostLikes (post_id, user_id) VALUES (?, ?)",
            [postId, userId]
        );

        // Update the post's like count
        await db.query(
            "UPDATE Posts SET likes = COALESCE(likes, 0) + 1 WHERE post_id = ?",
            [postId]
        );
        await notifyPostLiked(postId, userId);

        res.json({ message: "Post liked successfully" });
    } catch (error) {
        console.error("Error in likePost:", error);
        res.status(500).json({ message: "Error liking post" });
    }
};
const unlikePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.userId;

        const [existingLike] = await db.query(
            "SELECT * FROM PostLikes WHERE post_id = ? AND user_id = ?",
            [postId, userId]
        );

        if (existingLike.length === 0) {
            return res.status(400).json({ message: "You have not liked this post" });
        }

        await db.query(
            "DELETE FROM PostLikes WHERE post_id = ? AND user_id = ?",
            [postId, userId]
        );

        await db.query(
            "UPDATE Posts SET likes = GREATEST(likes - 1, 0) WHERE post_id = ?",
            [postId]
        );

        res.json({ message: "Post unliked successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error unliking post" });
    }
};

// Check if the current user has liked a post
const getLikeStatus = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.userId;

        const [existingLike] = await db.query(
            "SELECT * FROM PostLikes WHERE post_id = ? AND user_id = ?",
            [postId, userId]
        );

        res.json({ isLiked: existingLike.length > 0 });
    } catch (error) {
        res.status(500).json({ message: "Error checking like status" });
    }
};


module.exports = {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    getLikeStatus
};

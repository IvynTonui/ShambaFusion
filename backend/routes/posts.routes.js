const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    getLikeStatus
} = require('../controllers/posts.controller');

// Make sure all the route handlers are properly imported and defined
router.get('/', authenticateToken, getAllPosts);
router.get('/:id', authenticateToken, getPostById);
router.post('/', authenticateToken, createPost);
router.put('/:id', authenticateToken, updatePost);
router.delete('/:id', authenticateToken, deletePost);
router.put("/:id/like", authenticateToken, likePost);
router.put("/:id/unlike", authenticateToken, unlikePost);
router.get("/:id/like-status", authenticateToken, getLikeStatus);


module.exports = router;
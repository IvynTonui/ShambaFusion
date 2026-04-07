const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const {
    getPostComments,
    getCommentById,
    createComment,
    updateComment,
    deleteComment,
    getCommentCount
} = require('../controllers/comments.controller');

router.get('/post/:postId', authenticateToken, getPostComments);
router.get('/:id', authenticateToken, getCommentById);
router.post('/', authenticateToken, createComment);
router.put('/:id', authenticateToken, updateComment);
router.delete('/:id', authenticateToken, deleteComment);
router.get('/post/:postId/count', authenticateToken, getCommentCount);

module.exports = router;
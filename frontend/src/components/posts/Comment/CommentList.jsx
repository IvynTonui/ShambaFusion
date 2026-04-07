import React, { useState, useEffect } from "react";
import { commentService } from "../../../services/service.js";

const CommentList = ({ postId, onCommentAdded }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (postId) {
            fetchComments();
        }
    }, [postId]);

    const fetchComments = async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedComments = await commentService.getCommentsByPostId(postId);
            setComments(fetchedComments);
        } catch (error) {
            setError("Failed to load comments");
            console.error("❌ Error fetching comments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            setLoading(true);
            setError(null);
            await commentService.createComment(postId, newComment.trim());
            setNewComment("");
            // Fetch updated comments list after adding new comment
            await fetchComments();
            // Notify parent component about the new comment
            if (onCommentAdded) onCommentAdded();
        } catch (error) {
            setError("Failed to add comment");
            console.error("❌ Error adding comment:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!postId) {
        return null;
    }

    return (
        <div className="bg-gray-100 p-4 rounded-lg">
            <h4 className="font-semibold">Comments ({comments.length})</h4>

            {error && (
                <div className="bg-red-100 text-red-700 p-2 rounded my-2">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                {comments.length === 0 ? (
                    <p className="text-gray-500">No comments yet.</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.comment_id} className="p-2 bg-white rounded shadow-sm">
                            <div className="flex justify-between items-start">
                                <p>{comment.comment}</p>
                                {comment.author_name && (
                                    <span className="text-sm text-gray-500">
                                        {comment.author_name}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-3 flex gap-2">
                <input
                    type="text"
                    className="border rounded px-3 py-1 flex-1"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' && !loading) {
                            handleAddComment();
                        }
                    }}
                    disabled={loading}
                />
                <button
                    onClick={handleAddComment}
                    disabled={loading || !newComment.trim()}
                    className={`${
                        loading || !newComment.trim()
                            ? 'bg-gray-400'
                            : 'bg-green-600 hover:bg-green-700'
                    } text-white px-3 py-1 rounded`}
                >
                    {loading ? "Posting..." : "Post"}
                </button>
            </div>
        </div>
    );
};

export default CommentList;
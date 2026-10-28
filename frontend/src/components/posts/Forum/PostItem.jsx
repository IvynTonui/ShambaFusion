import { Link } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import { MessageSquare, ThumbsUp, Share2, Edit, Trash2, Check } from "lucide-react";
import EditPostForm from "./EditPostForm.jsx";
import DeletePostButton from "./DeletePostButton.jsx";
import CommentList from "../Comment/CommentList.jsx";
import { postService } from "../../../services/service.js";

const PostItem = ({
                      user_id,
                      id,
                      author,
                      title,
                      content,
                      category_id,
                      likes,
                      comment_count,
                      time,
                      onPostUpdated,
                      onPostDeleted
                  }) => {

    const currentUser = JSON.parse(localStorage.getItem("user") || "null");
    const owner = currentUser?.id === user_id;
    const [showComments, setShowComments] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [likeCount, setLikeCount] = useState(likes || 0);
    const [isLiked, setIsLiked] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [likeError, setLikeError] = useState(null);
    const [localCommentCount, setLocalCommentCount] = useState(comment_count || 0);

    useEffect(() => {
        setLikeCount(likes || 0);
        setLocalCommentCount(comment_count || 0);

        // Check if the user has already liked this post
        const checkIfLiked = async () => {
            try {
                const hasLiked = await postService.checkIfLiked(id);
                setIsLiked(hasLiked);
            } catch (err) {
                console.error("Error checking like status:", err);
            }
        };

        checkIfLiked();
    }, [likes, comment_count, id]);

    const handleLike = async () => {
        if (!id || isLiking) return;

        setIsLiking(true);
        try {
            if (isLiked) {
                // Unlike the post
                await postService.unlikePost(id);
                setLikeCount(prev => Math.max(0, prev - 1));
                setIsLiked(false);
            } else {
                // Like the post
                await postService.likePost(id);
                setLikeCount(prev => prev + 1);
                setIsLiked(true);
            }
            setLikeError(null);
        } catch (err) {
            console.error("Error toggling like:", err);
            setLikeError(isLiked ? "Failed to unlike post" : "Failed to like post");
        } finally {
            setIsLiking(false);
        }
    };

    const handleCommentAdded = () => {
        setLocalCommentCount(prev => prev + 1);
    };

    const handleShare = () => {
        const postUrl = `${window.location.origin}/post/${id}`;
        navigator.clipboard.writeText(postUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            {isEditing ? (
                <EditPostForm
                    postId={id}
                    title={title}
                    content={content}
                    category_id={category_id}
                    onClose={() => setIsEditing(false)}
                    onPostUpdated={onPostUpdated}
                />
            ) : (
                <>
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-medium text-green-700">{author}</h3>
                            <p className="text-sm text-gray-500">{formatDate(time)}</p>
                        </div>
                        <div className="flex gap-2">
                            {owner && <>
                            <button
                                aria-label="Edit discussion"
                                onClick={() => setIsEditing(true)}
                                className="text-blue-500 hover:text-blue-700"
                            >
                                <Edit size={18} />
                            </button>
                            </>}
                            {(owner || currentUser?.role === "admin") && <DeletePostButton postId={id} onPostDeleted={onPostDeleted} />}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold"><Link className="hover:text-green-700 hover:underline" to={`/post/${id}`}>{title}</Link></h4>
                        <p className="text-gray-600 mt-2">{content}</p>
                    </div>

                    <div className="flex items-center gap-6 pt-4 border-t">
                        <button
                            onClick={handleLike}
                            disabled={isLiking}
                            className={`flex items-center gap-2 transition-colors ${
                                isLiked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                            }`}
                        >
                            <ThumbsUp size={18} className={isLiked ? 'fill-blue-600' : ''} />
                            <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
                        </button>

                        <button
                            onClick={() => setShowComments(!showComments)}
                            className="flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors"
                        >
                            <MessageSquare size={18}/>
                            <span>{localCommentCount} Comments</span>
                        </button>

                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors"
                        >
                            <Share2 size={18} />
                            <span>{isCopied ? 'Copied!' : 'Share'}</span>
                        </button>
                    </div>

                    {likeError && <p className="text-red-500 text-sm">{likeError}</p>}
                    {showComments && (
                        <CommentList
                            postId={id}
                            onCommentAdded={handleCommentAdded}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default PostItem;
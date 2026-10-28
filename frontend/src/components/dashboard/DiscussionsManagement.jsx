import React, { useState, useEffect } from "react";
import { postService } from "../../services/service";

const DiscussionsManagement = () => {
    const [posts, setPosts] = useState([]); // Initialize posts as an array
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null); // Tracks loading for specific actions

    // Fetch posts on component mount
    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setIsLoading(true); // Show loading spinner
        try {
            const response = await postService.getPosts();
            console.log("Fetched Posts:", response);
            setPosts(response.posts || []); // Safeguard for posts being undefined
        } catch (err) {
            console.error("Error fetching posts:", err);
            setError("Failed to fetch posts. Please try again later.");
        } finally {
            setIsLoading(false); // Remove loading spinner
        }
    };

    // Ensure consistency with post.post_id or post.post_id
    const handleDelete = async (postId) => {
        console.log('Attempting to delete post:', {
            postId: postId,
            type: typeof postId
        });

        if (!window.confirm("Are you sure you want to delete this post?")) return;

        setActionLoading(postId);
        try {
            await postService.deletePost(postId);
            setPosts(posts.filter((post) => post.post_id !== postId));
        } catch (err) {
            console.error("Detailed error deleting post:", err);
            console.log('Error response:', err.response);
            setError("Failed to delete the post. Please try again.");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Manage Discussions</h3>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}{" "}
                        <button
                            onClick={fetchPosts}
                            className="text-blue-600 underline font-semibold"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {isLoading ? (
                    <p className="text-gray-600 text-center">Loading posts...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-gray-300">
                            <thead>
                            <tr className="bg-gray-200 text-left">
                                <th className="px-6 py-3 text-gray-600 font-semibold">Title</th>
                                <th className="px-6 py-3 text-gray-600 font-semibold">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {posts.length > 0 ? (
                                posts.map((post) => (
                                    <tr
                                        key={post.post_id}
                                        className="border-t hover:bg-gray-100 transition"
                                    >
                                        <td className="px-6 py-4">{post.title}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDelete(post.post_id)}
                                                className={`${
                                                    actionLoading === post.post_id
                                                        ? "text-gray-400 cursor-not-allowed"
                                                        : "text-red-600 hover:text-red-800"
                                                } font-medium`}
                                                disabled={actionLoading === post.post_id}
                                            >
                                                {actionLoading === post.post_id
                                                    ? "Deleting..."
                                                    : "Delete"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="2"
                                        className="text-center text-gray-600 py-4"
                                    >
                                        No posts available.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiscussionsManagement;

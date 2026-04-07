import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { MessageSquare, ThumbsUp, Share2, Loader2 } from 'lucide-react';
import Alert from '../../ui/Alert.jsx';
import CreatePostForm from './CreatePostForm';
import CommentList from "../Comment/CommentList";
import { postService, categoryService } from "../../../services/service";
import PostItem from "./PostItem.jsx";

const PostList = ({ user }) => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchCategories();
        fetchPosts();
    }, [selectedCategory]);

    const fetchCategories = async () => {
        try {
            const response = await categoryService.getAllCategories();
            console.log("Fetched Categories:", response);
            setCategories(response.categories || response || []);
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    };

    const fetchPosts = async () => {
        try {
            setIsLoading(true);
            setError(null);
            let response;
            if (selectedCategory && selectedCategory !== "") {
                response = await categoryService.getPostsByCategory(selectedCategory);
            } else {
                response = await postService.getPosts();
            }
            console.log("🔍 API Response:", response);

            if (response && response.posts && Array.isArray(response.posts)) {
                setPosts(response.posts);
            } else {
                setPosts([]);
                console.warn("⚠️ No posts found for the selected category.");
            }
        } catch (err) {
            console.error("❌ Error fetching posts:", err);
            setError('Failed to load posts. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePostCreated = (newPost) => {
        setPosts([newPost, ...posts]);
        setShowCreateForm(false);
    };

    const handlePostUpdated = (postId, updatedData) => {
        setPosts(posts.map(post => (post.post_id === postId ? { ...post, ...updatedData } : post)));
    };

    const handlePostDeleted = (postId) => {
        setPosts(posts.filter(post => post.post_id !== postId));
    };

    if (!user) {
        return (
            <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <MessageSquare size={48} className="mx-auto text-blue-500 mb-4" />
                    <h2 className="text-xl font-semibold text-blue-800 mb-2">
                        Join the Farming Community
                    </h2>
                    <p className="text-blue-600 mb-4">
                        Connect with farmers, share experiences, and learn from others.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/register" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                            Join Now
                        </Link>
                        <Link to="/login" className="bg-white text-green-600 px-6 py-2 rounded-lg border border-green-600 hover:bg-green-50">
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Discussion Forum</h2>
                <select
                    value={selectedCategory || ""}
                    onChange={(e) => setSelectedCategory(e.target.value || null)}
                    className="border rounded-lg px-4 py-2"
                >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                        <option key={category.category_id} value={category.category_id}>
                            {category.name}
                        </option>
                    ))}
                </select>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                    + New Post
                </button>
            </div>

            {showCreateForm && (
                <CreatePostForm
                    onPostCreated={handlePostCreated}
                    onClose={() => setShowCreateForm(false)}
                />
            )}

            {isLoading ? (
                <div className="flex justify-center items-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600"/>
                </div>
            ) : error ? (
                <Alert variant="destructive">{error}</Alert>
            ) : posts.length === 0 ? (
                <div className="text-center p-12 text-gray-500">
                    No posts yet. Be the first to share something!
                </div>
            ) : (
                <div className="space-y-4">
                    {posts.map((post) => (
                        <PostItem
                            key={post.post_id}
                            id={post.post_id}
                            author={post.author_name}  // Pass author_name from API
                            title={post.title}
                            content={post.content}
                            category_id={post.category_id}
                            likes={post.likes}
                            comment_count={post.comment_count || 0}
                            time={post.created_at}
                            onPostUpdated={handlePostUpdated}
                            onPostDeleted={handlePostDeleted}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PostList;
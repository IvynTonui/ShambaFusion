import React, { useState, useEffect } from 'react';
import { postService, categoryService } from "../../../services/service.js"; // Ensure correct import

const CreatePostForm = ({ onPostCreated, onClose }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category_id: '' // Added category field
    });
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getAllCategories(); // Ensure correct API call
                console.log("Available Categories:", response);
                setCategories(response);
            } catch (err) {
                console.error("Error fetching categories:", err);
                setError("Failed to load categories.");
            }
        };
        fetchCategories();
    }, []);

    // Handle input change
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        if (!formData.title || !formData.content || !formData.category_id) {
            setError("All fields are required.");
            setIsSubmitting(false);
            return;
        }

        try {
            const createdPost = await postService.createPost(formData);
            onPostCreated(createdPost);
            onClose();
        } catch (err) {
            console.error("Failed to create post", err);
            setError("Failed to create discussion. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
                <h2 className="text-2xl font-bold mb-4">Create New Discussion</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title Input */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter discussion title"
                            required
                        />
                    </div>

                    {/* Category Dropdown */}
                    <div>
                        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                            id="category_id"
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                                <option key={category.category_id} value={category.category_id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Content Input */}
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
                        <textarea
                            id="content"
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            rows={4}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter your discussion content"
                            required
                        />
                    </div>

                    {/* Error Message */}
                    {error && <div className="text-red-500 text-sm">{error}</div>}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Discussion'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePostForm;

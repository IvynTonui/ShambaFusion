import React, { useState, useEffect } from "react";
import { postService, categoryService } from "../../../services/service.js";

const EditPostForm = ({ postId, title, content, category_id, onClose, onPostUpdated }) => {
    const [formData, setFormData] = useState({
        title,
        content,
        category_id: category_id || ''
    });
    const [categories, setCategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Fetch categories when component mounts
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getAllCategories();
                setCategories(response);
            } catch (err) {
                console.error("Error fetching categories:", err);
                setError("Failed to load categories");
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        // Validate inputs
        if (!formData.title || !formData.content || !formData.category_id) {
            setError("All fields are required");
            setIsSubmitting(false);
            return;
        }

        try {
            await postService.updatePost(postId, formData);
            onPostUpdated(postId, formData); // Update parent state
            onClose(); // Close edit form
        } catch (err) {
            console.error("Error updating post:", err);
            setError("Failed to update post. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-bold mb-2">Edit Post</h3>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="title"
                    placeholder="Post title"
                    value={formData.title}
                    onChange={handleChange}
                    className="block w-full border rounded p-2 mb-2"
                />

                <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="block w-full border rounded p-2 mb-2"
                >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                        <option key={category.category_id} value={category.category_id}>
                            {category.name}
                        </option>
                    ))}
                </select>

                <textarea
                    name="content"
                    placeholder="Post content"
                    value={formData.content}
                    onChange={handleChange}
                    className="block w-full border rounded p-2 mb-2"
                    rows={4}
                />

                {error && <p className="text-red-500">{error}</p>}

                <div className="flex gap-2">
                    <button
                        type="submit"
                        className="bg-green-500 text-white px-4 py-2 rounded"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Saving..." : "Save"}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 px-4 py-2 border rounded"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditPostForm;
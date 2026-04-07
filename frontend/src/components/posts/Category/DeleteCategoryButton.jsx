import React, { useState } from 'react';
import { categoryService } from '../../../services/service.js'; // Update path as needed

const DeleteCategoryButton = ({ categoryId, onDelete }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;

        setIsDeleting(true);
        setError(null);

        try {
            await categoryService.deleteCategory(categoryId);
            onDelete(categoryId);
        } catch (err) {
            console.error('Error deleting category:', err);
            setError('Failed to delete category. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div>
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`text-red-600 hover:text-red-800 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    );
};

export default DeleteCategoryButton;

import React from 'react';
import DeleteCategoryButton from './DeleteCategoryButton';

const CategoryItem = ({ category, onEdit, onDelete }) => {
    return (
        <div className="border rounded-lg p-4 flex justify-between items-center">
            <div>
                <h3 className="font-semibold">{category.name}</h3>
                <p className="text-gray-600">{category.description}</p>
            </div>
            <div className="space-x-2">
                <button
                    onClick={() => onEdit(category)}
                    className="text-blue-600 hover:text-blue-800"
                >
                    Edit
                </button>
                <button
                    onClick={() => onDelete(category.category_id)}
                    className="text-red-600 hover:text-red-800"
                >
                    Delete
                </button>
            </div>
        </div>
    );
};

export default CategoryItem;

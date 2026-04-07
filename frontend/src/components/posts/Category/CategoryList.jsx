import React, { useState, useEffect } from 'react';
import {categoryService} from "../../../services/service.js"; // Update import path as needed
import CategoryItem from './CategoryItem';
import NewCategoryForm from './NewCategoryForm';
import EditCategoryForm from './EditCategoryForm';


const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [editingCategory, setEditingCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const fetchCategories = async () => {
        try {
            const response = await categoryService.getAllCategories();
            console.log("Fetched Categories: ", response)
            setCategories(response.categories || response || []);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCategoryAdded = (newCategory) => {
        setCategories([newCategory, ...categories]);
    };

    const handleCategoryUpdated = (updatedCategory) => {
        setCategories(categories.map(cat =>
            (cat.category_id === updatedCategory.category_id ? updatedCategory : cat)
        ));
        setEditingCategory(null);
    };

    const handleCategoryDeleted = (categoryId) => {
        setCategories(categories.filter(cat => cat.category_id !== categoryId));
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                    + New Category
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-800 p-4 rounded-lg">
                    {error}
                    <button
                        onClick={fetchCategories}
                        className="ml-4 text-red-600 hover:underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    {categories && categories.length > 0 ? (
                        categories.map((category) => (
                            <CategoryItem
                                key={category.category_id}
                                category={category}
                                onEdit={() => setEditingCategory(category)}
                                onDelete={handleCategoryDeleted}
                            />
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">No categories found</p>
                    )}
                </div>
            )}

            {showCreateForm && (
                <NewCategoryForm
                    onCategoryAdded={handleCategoryAdded}
                    onClose={() => setShowCreateForm(false)}
                />
            )}

            {editingCategory && (
                <EditCategoryForm
                    category={editingCategory}
                    onCategoryUpdated={handleCategoryUpdated}
                    onClose={() => setEditingCategory(null)}
                />
            )}
        </div>
    );
};

export default CategoryList;
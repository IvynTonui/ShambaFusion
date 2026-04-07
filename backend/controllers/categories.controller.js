const db = require('../config/db.config');

// Get all categories
const getAllCategories = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM Categories ORDER BY name');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
};

// Get single category with associated posts and resources
const getCategoryById = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM Categories WHERE category_id = ?', [req.params.id]);

        if (categories.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Get associated posts and resources
        const [posts] = await db.query('SELECT * FROM Posts WHERE category_id = ?', [req.params.id]);
        const [resources] = await db.query('SELECT * FROM Resources WHERE category_id = ?', [req.params.id]);

        const category = categories[0];
        category.posts = posts;
        category.resources = resources;

        res.json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching category', error: error.message });
    }
};

// Create category (admin only)
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can create categories' });
        }

        const [result] = await db.query(
            'INSERT INTO Categories (name, description) VALUES (?, ?)',
            [name, description]
        );

        res.status(201).json({
            message: 'Category created successfully',
            category_id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating category', error: error.message });
    }
};

// Update category (admin only)
const updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const categoryId = req.params.id;

        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can update categories' });
        }

        const [result] = await db.query(
            'UPDATE Categories SET name = ?, description = ? WHERE category_id = ?',
            [name, description, categoryId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json({ message: 'Category updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating category', error: error.message });
    }
};

// Delete category (admin only)
const deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;

        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can delete categories' });
        }

        // Check if category has associated posts or resources
        const [posts] = await db.query('SELECT COUNT(*) as count FROM Posts WHERE category_id = ?', [categoryId]);
        const [resources] = await db.query('SELECT COUNT(*) as count FROM Resources WHERE category_id = ?', [categoryId]);

        if (posts[0].count > 0 || resources[0].count > 0) {
            return res.status(400).json({ message: 'Cannot delete category with associated posts or resources' });
        }

        const [result] = await db.query('DELETE FROM Categories WHERE category_id = ?', [categoryId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting category', error: error.message });
    }
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
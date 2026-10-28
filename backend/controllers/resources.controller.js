const db = require("../config/db.config");
const path = require('path');
const fs = require('fs');
const { notifyResourceAdded } = require('../utils/notifications.utils');

const getResources = async (req, res) => {
    try {
        const [resources] = await db.query(`
            SELECT resource_id, name, description, category_id, file_url, uploaded_by
            FROM Resources
        `);
        res.json(resources);
    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({
            message: "Error fetching resources"
        });
    }
};

const getResourceById = async (req, res) => {
    try {
        const [resources] = await db.query(
            "SELECT * FROM Resources WHERE resource_id = ?",
            [req.params.id]
        );

        if (resources.length === 0) {
            return res.status(404).json({ message: "Resource not found" });
        }

        res.json(resources[0]);
    } catch (error) {
        console.error('Error fetching resource:', error);
        res.status(500).json({
            message: "Error fetching resource"
        });
    }
};

const createResource = async (req, res) => {
    try {
        const { name, description, category_id } = req.body;

        // Validate input
        if (!name || !description) {
            return res.status(400).json({
                message: "Name and description are required"
            });
        }

        // Validate file upload
        if (!req.file) {
            return res.status(400).json({
                message: "File is required"
            });
        }

        const uploaded_by = req.user.userId;
        const file_url = `/uploads/${req.file.filename}`;

        const [result] = await db.query(
            "INSERT INTO Resources (name, description, category_id, file_url, uploaded_by) VALUES (?, ?, ?, ?, ?)",
            [name.trim(), description.trim(), category_id || null, file_url, uploaded_by]
        );
        // After successfully creating the resource
        await notifyResourceAdded(result.insertId, name, uploaded_by);

        res.status(201).json({
            message: "Resource added successfully",
            resource_id: result.insertId
        });
    } catch (error) {
        if (req.file?.path) await fs.promises.unlink(req.file.path).catch(() => {});
        console.error('Error adding resource:', error);
        res.status(500).json({
            message: "Error adding resource"
        });
    }
};

const updateResource = async (req, res) => {
    try {
        const { name, description, category_id } = req.body;
        const resourceId = req.params.id;
        const userId = req.user.userId;
        const userRole = req.user.role;

        // Validate input
        if (!name || !description) {
            return res.status(400).json({
                message: "Name and description are required"
            });
        }

        // Check resource existence and authorization
        const [resources] = await db.query(
            "SELECT * FROM Resources WHERE resource_id = ?",
            [resourceId]
        );

        if (resources.length === 0) {
            return res.status(404).json({ message: "Resource not found" });
        }

        // Check user permissions
        if (resources[0].uploaded_by !== userId && userRole !== "admin") {
            return res.status(403).json({
                message: "Unauthorized to update this resource"
            });
        }

        // Perform update
        await db.query(
            "UPDATE Resources SET name = ?, description = ?, category_id = ? WHERE resource_id = ?",
            [name, description, category_id, resourceId]
        );

        res.json({ message: "Resource updated successfully" });
    } catch (error) {
        console.error('Error updating resource:', error);
        res.status(500).json({
            message: "Error updating resource"
        });
    }
};

const deleteResource = async (req, res) => {
    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const resourceId = req.params.id;
        const userId = req.user.userId;
        const userRole = req.user.role;

        // Check resource existence and get file path
        const [resources] = await connection.query(
            "SELECT * FROM Resources WHERE resource_id = ?",
            [resourceId]
        );

        if (resources.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Resource not found" });
        }

        // Check user permissions
        if (resources[0].uploaded_by !== userId && userRole !== "admin") {
            await connection.rollback();
            return res.status(403).json({
                message: "Unauthorized to delete this resource"
            });
        }

        // Get file path for deletion
        const filePath = path.join(__dirname, '..', resources[0].file_url);

        // Delete database record
        await connection.query(
            "DELETE FROM Resources WHERE resource_id = ?",
            [resourceId]
        );

        // Attempt to delete file
        try {
            await fs.promises.unlink(filePath);
        } catch (fileError) {
            console.warn(`Could not delete file: ${filePath}`, fileError);
            // Continue with transaction even if file deletion fails
        }

        await connection.commit();

        res.json({ message: "Resource deleted successfully" });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error deleting resource:', error);
        res.status(500).json({
            message: "Error deleting resource"
        });
    } finally {
        connection?.release();
    }
};

const downloadResource = async (req, res) => {
    try {
        const [resource] = await db.query(
            "SELECT * FROM Resources WHERE resource_id = ?",
            [req.params.id]
        );

        if (resource.length === 0) {
            return res.status(404).json({ message: "Resource not found" });
        }

        const filePath = path.join(__dirname, '..', resource[0].file_url);

        // Check if file exists before attempting to download
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: "File not found" });
        }

        res.download(filePath, resource[0].name + path.extname(filePath), (err) => {
            if (err) {
                console.error('Download error:', err);
                res.status(500).json({ message: "Error downloading resource" });
            }
        });
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ message: "Error downloading resource" });
    }
};

module.exports = {
    getResources,
    getResourceById,
    createResource,
    updateResource,
    deleteResource,
    downloadResource
};
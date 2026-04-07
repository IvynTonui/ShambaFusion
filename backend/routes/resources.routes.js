const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const {
    getResources,
    getResourceById,
    createResource,
    updateResource,
    deleteResource,
    downloadResource
} = require("../controllers/resources.controller");

// Public routes
router.get("/", getResources);
router.get("/:id", getResourceById);

// Protected routes
router.post("/", authenticateToken, upload.single("file"), createResource);
router.put("/:id", authenticateToken, updateResource);
router.delete("/:id", authenticateToken, deleteResource);
router.get("/:id/download",authenticateToken, downloadResource);

module.exports = router;

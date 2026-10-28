const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getAllUsers,
  deleteUser,
  updateUserRole,
} = require("../controllers/auth.controller");

const { authenticateToken } = require("../middleware/auth.middleware");

const { requireAdmin } = require("../middleware/admin.middleware");

// Public authentication
router.post("/register", register);
router.post("/login", login);

// Protected administrator operations
router.get("/", authenticateToken, requireAdmin, getAllUsers);

router.delete("/:id", authenticateToken, requireAdmin, deleteUser);

router.put("/:id/role", authenticateToken, requireAdmin, updateUserRole);

module.exports = router;

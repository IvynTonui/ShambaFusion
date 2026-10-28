const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db.config");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (typeof name !== 'string' || !name.trim() || name.length > 120 || typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password) > 72) return res.status(400).json({message:'Provide a name, valid email and password of at least 8 characters (maximum 72 bytes).'});
    const role = "participant";

    // Check if user already exists
    const [existingUsers] = await db.query(
      "SELECT * FROM Users WHERE email = ?",
      [email],
    );
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    await db.query(
      "INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role],
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({message:'Email and password are required'});

    // Check if user exists
    const [users] = await db.query("SELECT * FROM Users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = users[0];

    // Validate password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Create and assign token
    const token = jwt.sign(
      {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role, // Include role in token
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );
    res.json({
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
};

// Fetch all users
const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
            SELECT user_id AS id, name, email, role, created_at
            FROM Users
            ORDER BY created_at DESC
        `);
    res.status(200).json(users); // Send the users as a response
  } catch (error) {
    console.error("Error fetching users:", error); // Log the error
    res
      .status(500)
      .json({ message: "Error fetching users" });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const [targets] = await db.query("SELECT role FROM Users WHERE user_id = ?", [id]);
    if (!targets.length) return res.status(404).json({message:"User not found"});
    if (targets[0].role === "admin") return res.status(403).json({message:"Administrator accounts cannot be deleted through the demo API"});
    await db.query(`DELETE FROM Users WHERE user_id = ?`, [id]);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting user" });
  }
};

// Update a user’s role
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!['admin','participant'].includes(role)) return res.status(400).json({message:'Unsupported role'}); // 'admin' or 'user'
  try {
    await db.query(`UPDATE Users SET role = ? WHERE user_id = ?`, [role, id]);
    res.status(200).json({ message: "User role updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user role" });
  }
};
module.exports = {
  register,
  login,
  getAllUsers,
  deleteUser,
  updateUserRole,
};

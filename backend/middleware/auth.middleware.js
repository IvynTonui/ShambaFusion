const jwt = require("jsonwebtoken");

const db = require("../config/db.config");
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const token = authHeader.slice(7);

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    const [users] = await db.query('SELECT user_id, role FROM Users WHERE user_id = ?', [verified.userId]);
    if (!users.length) return res.status(401).json({message:'Account no longer available'});
    req.user = {...verified, role: users[0].role};
    next();
  } catch (err) {
    if (!["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(err.name)) return res.status(503).json({message:"Authentication service unavailable"});
    return res.status(401).json({message:"Invalid or expired token"});
  }
};

module.exports = { authenticateToken };

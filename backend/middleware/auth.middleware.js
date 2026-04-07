const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log("Auth Header Received:", authHeader); // Debugging

    const token = authHeader && authHeader.split(' ')[1];
    console.log("Extracted Token:", token); // Debugging

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", verified); // Debugging
        req.user = verified;
        next();
    } catch (err) {
        console.log("JWT Error:", err.message); // Debugging
        res.status(403).json({ message: 'Invalid token.' });
    }
};

module.exports = { authenticateToken };

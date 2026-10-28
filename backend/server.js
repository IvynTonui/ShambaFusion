const express = require('express');
const cors = require('cors');
require('dotenv').config()

const authRoutes = require('./routes/auth.routes');
const postsRoutes = require('./routes/posts.routes');
const resourcesRoutes = require('./routes/resources.routes');
const categoriesRoutes = require('./routes/categories.routes');
const commentsRoutes = require('./routes/comments.routes')
const notificationsRoutes = require('./routes/notifications.routes');
const systemRoutes = require('./routes/system.routes');

const app = express();

// Middleware
app.disable('x-powered-by');
app.use(cors({origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173'}));
app.use((req,res,next) => { res.setHeader('X-Content-Type-Options','nosniff'); next(); });
const { rateLimit } = require('express-rate-limit');
app.use('/api/auth/login', rateLimit({windowMs: 15*60*1000, limit: 30}));
app.use('/api/auth/register', rateLimit({windowMs: 15*60*1000, limit: 20}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req,res,next) => {
  for (const key of ['title','content','comment','name','description']) {
    if (key in (req.body || {}) && (typeof req.body[key] !== 'string' || !req.body[key].trim() || req.body[key].length > (key === 'title' || key === 'name' ? 255 : 10000))) return res.status(400).json({message:'Text fields must be nonempty and within size limits.'});
  }
  next();
});
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/system', systemRoutes);

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Smart Agriculture API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
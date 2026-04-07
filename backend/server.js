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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.use('/uploads', express.static('uploads'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
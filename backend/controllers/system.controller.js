const db = require('../config/db.config');

const getSystemMetrics = async (req, res) => {
    try {
        // Get total users count
        const [userCount] = await db.query('SELECT COUNT(*) as count FROM Users');
        const totalUsers = userCount[0].count;

        // Get last registered user
        const [lastUser] = await db.query(`
      SELECT name, email, created_at 
      FROM Users 
      ORDER BY created_at DESC 
      LIMIT 1
    `);

        // Get total posts count
        const [postCount] = await db.query('SELECT COUNT(*) as count FROM Posts');
        const totalPosts = postCount[0].count;

        // Get most active category
        const [activeCategory] = await db.query(`
      SELECT Categories.category_id, Categories.name, COUNT(Posts.post_id) as post_count
      FROM Categories
      LEFT JOIN Posts ON Categories.category_id = Posts.category_id
      GROUP BY Categories.category_id
      ORDER BY post_count DESC
      LIMIT 1
    `);

        // Get total resources count
        const [resourceCount] = await db.query('SELECT COUNT(*) as count FROM Resources');
        const totalResources = resourceCount[0].count;

        // Get last accessed resource (assuming there's a last_accessed field in Resources table)
        // If you don't have this field, you might want to remove this query or modify accordingly
        const [lastResource] = await db.query(`
      SELECT name, file_url 
      FROM Resources 
      ORDER BY created_at DESC 
      LIMIT 1
    `);

        // Get user registration data by month (last 6 months)
        const [registrationData] = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, '%b %Y') as month,
        COUNT(*) as count
      FROM Users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY created_at
    `);

        // Get post activity by category
        const [categoryActivity] = await db.query(`
      SELECT 
        Categories.name as category,
        COUNT(Posts.post_id) as posts
      FROM Categories
      LEFT JOIN Posts ON Categories.category_id = Posts.category_id
      GROUP BY Categories.category_id
      ORDER BY posts DESC
      LIMIT 5
    `);

        res.json({
            totalUsers,
            lastRegisteredUser: lastUser[0] || null,
            totalPosts,
            mostActiveCategory: activeCategory[0] || null,
            totalResources,
            lastAccessedResource: lastResource[0] || null,
            userRegistrationData: registrationData,
            postActivityData: categoryActivity
        });

    } catch (error) {
        console.error('Error fetching system metrics:', error);
        res.status(500).json({ message: 'Error fetching system metrics', error: error.message });
    }
};

module.exports = {
    getSystemMetrics
};
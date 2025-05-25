const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get platforms for a user
router.get('/', async (req, res) => {
    const username = req.headers['x-username'];
    if (!username) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    const category = req.query.category;
    try {
        let query = `
            SELECT p.*, 
                   CASE WHEN up.platform_id IS NOT NULL THEN 1 ELSE 0 END as is_favorite
            FROM platforms p
            LEFT JOIN (
                SELECT platform_id 
                FROM user_platform_favorites 
                WHERE username = ?
            ) up ON p.id = up.platform_id
            WHERE 1=1
        `;
        
        const params = [username];

        if (category && category !== 'all') {
            if (category === 'favorites') {
                query += ` AND up.platform_id IS NOT NULL`;
            } else {
                query += ` AND p.category = ?`;
                params.push(category);
            }
        }

        query += ` ORDER BY p.category, p.platform_name`;

        const [platforms] = await pool.query(query, params);
        res.json(platforms);
    } catch (error) {
        console.error('Error fetching platforms:', error);
        res.status(500).json({ message: 'Error fetching platforms' });
    }
});

// Toggle platform favorite status
router.post('/:platformId/favorite', async (req, res) => {
    const username = req.headers['x-username'];
    if (!username) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    const platformId = req.params.platformId;

    try {
        // Check if platform exists
        const [platform] = await pool.query(
            'SELECT 1 FROM platforms WHERE id = ?',
            [platformId]
        );

        if (platform.length === 0) {
            return res.status(404).json({ message: 'Platform not found' });
        }

        // Check if already favorited
        const [favorite] = await pool.query(
            'SELECT 1 FROM user_platform_favorites WHERE username = ? AND platform_id = ?',
            [username, platformId]
        );

        if (favorite.length > 0) {
            // Remove from favorites
            await pool.query(
                'DELETE FROM user_platform_favorites WHERE username = ? AND platform_id = ?',
                [username, platformId]
            );
        } else {
            // Add to favorites
            await pool.query(
                'INSERT INTO user_platform_favorites (username, platform_id) VALUES (?, ?)',
                [username, platformId]
            );
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error toggling platform favorite:', error);
        res.status(500).json({ message: 'Error updating favorite status' });
    }
});

module.exports = router; 
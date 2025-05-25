const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all bookmarks for a user
router.get('/', async (req, res) => {
    try {
        const username = req.headers['x-username'] || 'demo_user';
        const [rows] = await pool.query(
            'SELECT * FROM bookmarks WHERE username = ? ORDER BY created_at DESC',
            [username]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching bookmarks:', error);
        res.status(500).json({ error: 'Failed to fetch bookmarks' });
    }
});

// Add a new bookmark
router.post('/', async (req, res) => {
    try {
        const username = req.headers['x-username'] || 'demo_user';
        const { title, url, description, tags } = req.body;

        const [result] = await pool.query(
            `INSERT INTO bookmarks (username, title, url, description, tags)
             VALUES (?, ?, ?, ?, ?)`,
            [username, title, url, description, JSON.stringify(tags)]
        );

        const [newBookmark] = await pool.query(
            'SELECT * FROM bookmarks WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json(newBookmark[0]);
    } catch (error) {
        console.error('Error adding bookmark:', error);
        res.status(500).json({ error: 'Failed to add bookmark' });
    }
});

// Delete a bookmark
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const username = req.headers['x-username'] || 'demo_user';

        const [result] = await pool.query(
            'DELETE FROM bookmarks WHERE id = ? AND username = ?',
            [id, username]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Bookmark not found' });
        }

        res.json({ message: 'Bookmark deleted successfully' });
    } catch (error) {
        console.error('Error deleting bookmark:', error);
        res.status(500).json({ error: 'Failed to delete bookmark' });
    }
});

module.exports = router; 
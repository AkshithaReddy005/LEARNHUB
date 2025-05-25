const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

// Course routes
router.get('/courses', auth, async (req, res) => {
    try {
        const [courses] = await pool.query(
            'SELECT * FROM courses WHERE user_id = ?',
            [req.user.id]
        );
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching courses' });
    }
});

router.post('/courses', auth, async (req, res) => {
    try {
        const { title, link, platform, category, difficulty, priority, status, notes, reminder, tags } = req.body;
        const [result] = await pool.query(
            'INSERT INTO courses (user_id, title, link, platform, category, difficulty, priority, status, notes, reminder, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, title, link, platform, category, difficulty, priority, status, notes, reminder, JSON.stringify(tags)]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ error: 'Error adding course' });
    }
});

// Notes routes
router.get('/notes', auth, async (req, res) => {
    try {
        const [notes] = await pool.query(
            'SELECT * FROM notes WHERE user_id = ?',
            [req.user.id]
        );
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching notes' });
    }
});

router.post('/notes', auth, async (req, res) => {
    try {
        const { title, content, category, tags } = req.body;
        const [result] = await pool.query(
            'INSERT INTO notes (user_id, title, content, category, tags) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, title, content, category, JSON.stringify(tags)]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ error: 'Error adding note' });
    }
});

// Bookmarks routes
router.get('/bookmarks', auth, async (req, res) => {
    try {
        const [bookmarks] = await pool.query(
            'SELECT * FROM bookmarks WHERE user_id = ?',
            [req.user.id]
        );
        res.json(bookmarks);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching bookmarks' });
    }
});

router.post('/bookmarks', auth, async (req, res) => {
    try {
        const { title, link, description, category } = req.body;
        const [result] = await pool.query(
            'INSERT INTO bookmarks (user_id, title, link, description, category) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, title, link, description, category]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ error: 'Error adding bookmark' });
    }
});

// Delete routes
router.delete('/courses/:id', auth, async (req, res) => {
    try {
        await pool.query(
            'DELETE FROM courses WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting course' });
    }
});

router.delete('/notes/:id', auth, async (req, res) => {
    try {
        await pool.query(
            'DELETE FROM notes WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting note' });
    }
});

router.delete('/bookmarks/:id', auth, async (req, res) => {
    try {
        await pool.query(
            'DELETE FROM bookmarks WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        res.json({ message: 'Bookmark deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting bookmark' });
    }
});

module.exports = router; 
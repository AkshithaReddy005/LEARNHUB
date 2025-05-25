const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('../config/db');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/notes')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['application/pdf', 'application/msword', 'image/jpeg', 'image/png'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// Get all notes for a user
router.get('/', async (req, res) => {
    try {
        const username = req.headers['x-username'];
        if (!username) {
            return res.status(401).json({ error: 'Username is required' });
        }

        const [notes] = await pool.query(
            'SELECT * FROM notes WHERE username = ? ORDER BY position ASC',
            [username]
        );
        res.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

// Add a new note
router.post('/', upload.single('file'), async (req, res) => {
    try {
        const username = req.headers['x-username'];
        if (!username) {
            return res.status(401).json({ error: 'Username is required' });
        }

        const { title, description, tags } = req.body;
        const filePath = req.file ? req.file.path : null;

        const [result] = await pool.query(
            `INSERT INTO notes (username, title, description, file_path, tags, position)
             VALUES (?, ?, ?, ?, ?, (SELECT COALESCE(MAX(position), 0) + 1 FROM notes n2))`,
            [username, title, description, filePath, JSON.stringify(tags)]
        );

        res.status(201).json({
            id: result.insertId,
            username,
            title,
            description,
            file_path: filePath,
            tags: JSON.parse(tags)
        });
    } catch (error) {
        console.error('Error adding note:', error);
        res.status(500).json({ error: 'Failed to add note' });
    }
});

// Update note position (for drag and drop)
router.put('/:id/position', async (req, res) => {
    try {
        const username = req.headers['x-username'];
        if (!username) {
            return res.status(401).json({ error: 'Username is required' });
        }

        const { position } = req.body;
        const noteId = req.params.id;

        await pool.query(
            'UPDATE notes SET position = ? WHERE id = ? AND username = ?',
            [position, noteId, username]
        );

        res.json({ message: 'Note position updated successfully' });
    } catch (error) {
        console.error('Error updating note position:', error);
        res.status(500).json({ error: 'Failed to update note position' });
    }
});

// Delete a note
router.delete('/:id', async (req, res) => {
    try {
        const username = req.headers['x-username'];
        if (!username) {
            return res.status(401).json({ error: 'Username is required' });
        }

        const noteId = req.params.id;

        // Get the file path before deleting
        const [note] = await pool.query(
            'SELECT file_path FROM notes WHERE id = ? AND username = ?',
            [noteId, username]
        );

        if (note.length === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }

        // Delete the file if it exists
        if (note[0].file_path) {
            const fs = require('fs');
            fs.unlink(note[0].file_path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }

        // Delete the note from database
        await pool.query(
            'DELETE FROM notes WHERE id = ? AND username = ?',
            [noteId, username]
        );

        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

module.exports = router; 
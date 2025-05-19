const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Akki@2006',
    database: 'learning_hub',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create database pool
const pool = mysql.createPool(dbConfig);

// Initialize database first
require('./config/init-db');

// Then import routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const dashboardRoutes = require('./routes/dashboard');
const notesRoutes = require('./routes/notes');
const bookmarksRoutes = require('./routes/bookmarks');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/notes/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['application/pdf', 'application/msword', 'image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOC, and images are allowed.'));
        }
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/bookmarks', bookmarksRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Handle SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Notes Routes
app.post('/api/notes', upload.array('files', 5), async (req, res) => {
    try {
        const { title, content, category, tags } = req.body;
        const username = req.headers['x-username'];
        
        if (!username) {
            return res.status(401).json({ error: 'Username not provided' });
        }

        const files = req.files ? req.files.map(file => ({
            filename: file.filename,
            path: file.path,
            type: file.mimetype
        })) : [];

        const note = {
            note_id: Date.now().toString(),
            title,
            content,
            category,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            files,
            created_at: new Date(),
            updated_at: new Date()
        };

        const result = await db.collection('notes').insertOne({
            username,
            ...note
        });

        res.status(201).json({ message: 'Note created successfully', note: result.ops[0] });
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ error: 'Failed to create note' });
    }
});

app.get('/api/notes', async (req, res) => {
    try {
        const username = req.headers['x-username'];
        
        if (!username) {
            return res.status(401).json({ error: 'Username not provided' });
        }

        const notes = await db.collection('notes')
            .find({ username })
            .sort({ created_at: -1 })
            .toArray();

        res.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

app.delete('/api/notes/:noteId', async (req, res) => {
    try {
        const { noteId } = req.params;
        const username = req.headers['x-username'];
        
        if (!username) {
            return res.status(401).json({ error: 'Username not provided' });
        }

        const result = await db.collection('notes').deleteOne({
            username,
            note_id: noteId
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

app.put('/api/notes/:noteId', async (req, res) => {
    try {
        const { noteId } = req.params;
        const { title, content, category, tags, position } = req.body;
        const username = req.headers['x-username'];
        
        if (!username) {
            return res.status(401).json({ error: 'Username not provided' });
        }

        const updateData = {
            title,
            content,
            category,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            updated_at: new Date()
        };

        if (position !== undefined) {
            updateData.position = position;
        }

        const result = await db.collection('notes').updateOne(
            { username, note_id: noteId },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json({ message: 'Note updated successfully' });
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ error: 'Failed to update note' });
    }
});

// Bookmarks Routes
app.post('/api/bookmarks', async (req, res) => {
    try {
        const { courseId, title, url, description } = req.body;
        const username = req.headers['x-username'];
        
        if (!username) {
            return res.status(401).json({ error: 'Username not provided' });
        }

        const bookmark = {
            bookmark_id: Date.now().toString(),
            courseId,
            title,
            url,
            description,
            created_at: new Date()
        };

        const result = await db.collection('bookmarks').insertOne({
            username,
            ...bookmark
        });

        res.status(201).json({ message: 'Bookmark created successfully', bookmark: result.ops[0] });
    } catch (error) {
        console.error('Error creating bookmark:', error);
        res.status(500).json({ error: 'Failed to create bookmark' });
    }
});

app.get('/api/bookmarks', async (req, res) => {
    try {
        const username = req.headers['x-username'];
        
        if (!username) {
            return res.status(401).json({ error: 'Username not provided' });
        }

        const bookmarks = await db.collection('bookmarks')
            .find({ username })
            .sort({ created_at: -1 })
            .toArray();

        res.json(bookmarks);
    } catch (error) {
        console.error('Error fetching bookmarks:', error);
        res.status(500).json({ error: 'Failed to fetch bookmarks' });
    }
});

app.delete('/api/bookmarks/:bookmarkId', async (req, res) => {
    try {
        const { bookmarkId } = req.params;
        const username = req.headers['x-username'];
        
        if (!username) {
            return res.status(401).json({ error: 'Username not provided' });
        }

        const result = await db.collection('bookmarks').deleteOne({
            username,
            bookmark_id: bookmarkId
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Bookmark not found' });
        }

        res.json({ message: 'Bookmark deleted successfully' });
    } catch (error) {
        console.error('Error deleting bookmark:', error);
        res.status(500).json({ error: 'Failed to delete bookmark' });
    }
});

// Reminder Routes
app.get('/api/reminders', async (req, res) => {
    const username = req.headers['x-username'];
    if (!username) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
        const [reminders] = await pool.query(
            'SELECT * FROM reminders WHERE username = ? ORDER BY datetime ASC',
            [username]
        );
        res.json(reminders);
    } catch (error) {
        console.error('Error fetching reminders:', error);
        res.status(500).json({ message: 'Error fetching reminders' });
    }
});

app.post('/api/reminders', async (req, res) => {
    const username = req.headers['x-username'];
    if (!username) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    const { title, datetime, description } = req.body;
    if (!title || !datetime) {
        return res.status(400).json({ message: 'Title and datetime are required' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO reminders (username, title, datetime, description) VALUES (?, ?, ?, ?)',
            [username, title, datetime, description]
        );

        const [newReminder] = await pool.query(
            'SELECT * FROM reminders WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json(newReminder[0]);
    } catch (error) {
        console.error('Error creating reminder:', error);
        res.status(500).json({ message: 'Error creating reminder' });
    }
});

app.put('/api/reminders/:id/complete', async (req, res) => {
    const username = req.headers['x-username'];
    if (!username) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    const reminderId = req.params.id;

    try {
        const [result] = await pool.query(
            'UPDATE reminders SET completed = TRUE WHERE id = ? AND username = ?',
            [reminderId, username]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Reminder not found' });
        }

        const [updatedReminder] = await pool.query(
            'SELECT * FROM reminders WHERE id = ?',
            [reminderId]
        );

        res.json(updatedReminder[0]);
    } catch (error) {
        console.error('Error updating reminder:', error);
        res.status(500).json({ message: 'Error updating reminder' });
    }
});

app.delete('/api/reminders/:id', async (req, res) => {
    const username = req.headers['x-username'];
    if (!username) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    const reminderId = req.params.id;

    try {
        const [result] = await pool.query(
            'DELETE FROM reminders WHERE id = ? AND username = ?',
            [reminderId, username]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Reminder not found' });
        }

        res.json({ message: 'Reminder deleted successfully' });
    } catch (error) {
        console.error('Error deleting reminder:', error);
        res.status(500).json({ message: 'Error deleting reminder' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Akki@2006',
    database: 'learning_hub'
};

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Get all courses for a user
router.get('/', verifyToken, async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [courses] = await connection.execute(
            'SELECT * FROM courses WHERE username = ?',
            [req.user.username]
        );
        await connection.end();
        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Error fetching courses' });
    }
});

// Add a new course
router.post('/', verifyToken, async (req, res) => {
    const { name, description, platform, link } = req.body;
    
    if (!name) {
        return res.status(400).json({ message: 'Course name is required' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'INSERT INTO courses (username, name, description, platform, link) VALUES (?, ?, ?, ?, ?)',
            [req.user.username, name, description, platform, link]
        );
        
        const [newCourse] = await connection.execute(
            'SELECT * FROM courses WHERE id = ?',
            [result.insertId]
        );
        
        await connection.end();
        
        res.status(201).json(newCourse[0]);
    } catch (error) {
        console.error('Error adding course:', error);
        res.status(500).json({ message: 'Error adding course' });
    }
});

// Update a course
router.put('/:id', verifyToken, async (req, res) => {
    const { name, description, platform, link } = req.body;
    const courseId = req.params.id;

    if (!name) {
        return res.status(400).json({ message: 'Course name is required' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'UPDATE courses SET name = ?, description = ?, platform = ?, link = ? WHERE id = ? AND username = ?',
            [name, description, platform, link, courseId, req.user.username]
        );
        await connection.end();
        
        res.json({ message: 'Course updated successfully' });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ message: 'Error updating course' });
    }
});

// Delete a course
router.delete('/:id', verifyToken, async (req, res) => {
    const courseId = req.params.id;

    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'DELETE FROM courses WHERE id = ? AND username = ?',
            [courseId, req.user.username]
        );
        await connection.end();
        
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ message: 'Error deleting course' });
    }
});

module.exports = router; 
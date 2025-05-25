const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all groups (with optional filtering)
router.get('/', async (req, res) => {
    const username = req.headers['x-username'];
    if (!username) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    const filter = req.query.filter || 'all';

    try {
        let query = `
            SELECT g.*, 
                   COUNT(DISTINCT gm.username) as member_count,
                   COUNT(DISTINCT m.id) as message_count,
                   CASE WHEN g.owner_username = ? THEN 1 ELSE 0 END as is_owner
            FROM study_groups g
            LEFT JOIN group_members gm ON g.id = gm.group_id
            LEFT JOIN messages m ON g.id = m.group_id
        `;

        let params = [username];

        switch (filter) {
            case 'my-groups':
                query += ` WHERE g.id IN (SELECT group_id FROM group_members WHERE username = ?)`;
                params.push(username);
                break;
            case 'public':
                query += ` WHERE g.visibility = 'public'`;
                break;
        }

        query += ` GROUP BY g.id ORDER BY g.created_at DESC`;

        const [groups] = await pool.query(query, params);
        res.json(groups);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ message: 'Error fetching groups' });
    }
});

// Create a new group
router.post('/', async (req, res) => {
    const username = req.headers['x-username'];
    if (!username) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    const { name, description, visibility, tags } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Group name is required' });
    }

    try {
        // Start transaction
        await pool.query('START TRANSACTION');

        // Insert group
        const [groupResult] = await pool.query(
            'INSERT INTO study_groups (name, description, visibility, owner_username) VALUES (?, ?, ?, ?)',
            [name, description, visibility || 'public', username]
        );

        const groupId = groupResult.insertId;

        // Add owner as first member
        await pool.query(
            'INSERT INTO group_members (group_id, username) VALUES (?, ?)',
            [groupId, username]
        );

        // Add tags if provided
        if (tags && tags.length > 0) {
            const tagValues = tags.map(tag => [groupId, tag]);
            await pool.query(
                'INSERT INTO group_tags (group_id, tag) VALUES ?',
                [tagValues]
            );
        }

        await pool.query('COMMIT');

        // Fetch the created group with all details
        const [newGroup] = await pool.query(
            `SELECT g.*, 
                    COUNT(DISTINCT gm.username) as member_count,
                    COUNT(DISTINCT m.id) as message_count,
                    1 as is_owner
             FROM study_groups g
             LEFT JOIN group_members gm ON g.id = gm.group_id
             LEFT JOIN messages m ON g.id = m.group_id
             WHERE g.id = ?
             GROUP BY g.id`,
            [groupId]
        );

        res.status(201).json(newGroup[0]);
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error creating group:', error);
        res.status(500).json({ message: 'Error creating group' });
    }
});

// Get group messages
router.get('/:groupId/messages', async (req, res) => {
    const username = req.headers['x-username'];
    if (!username) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    const groupId = req.params.groupId;

    try {
        // Check if user is a member of the group
        const [membership] = await pool.query(
            'SELECT 1 FROM group_members WHERE group_id = ? AND username = ?',
            [groupId, username]
        );

        if (membership.length === 0) {
            return res.status(403).json({ message: 'Not a member of this group' });
        }

        const [messages] = await pool.query(
            `SELECT m.*, u.username 
             FROM messages m
             JOIN users u ON m.username = u.username
             WHERE m.group_id = ?
             ORDER BY m.created_at ASC`,
            [groupId]
        );

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Error fetching messages' });
    }
});

// Send a message to a group
router.post('/:groupId/messages', async (req, res) => {
    const username = req.headers['x-username'];
    if (!username) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    const groupId = req.params.groupId;
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'Message content is required' });
    }

    try {
        // Check if user is a member of the group
        const [membership] = await pool.query(
            'SELECT 1 FROM group_members WHERE group_id = ? AND username = ?',
            [groupId, username]
        );

        if (membership.length === 0) {
            return res.status(403).json({ message: 'Not a member of this group' });
        }

        const [result] = await pool.query(
            'INSERT INTO messages (group_id, username, content) VALUES (?, ?, ?)',
            [groupId, username, content]
        );

        const [newMessage] = await pool.query(
            `SELECT m.*, u.username 
             FROM messages m
             JOIN users u ON m.username = u.username
             WHERE m.id = ?`,
            [result.insertId]
        );

        res.status(201).json(newMessage[0]);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Error sending message' });
    }
});

// Join a group
router.post('/:groupId/join', async (req, res) => {
    const username = req.headers['x-username'];
    if (!username) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    const groupId = req.params.groupId;

    try {
        // Check if group exists and is public
        const [group] = await pool.query(
            'SELECT visibility FROM study_groups WHERE id = ?',
            [groupId]
        );

        if (group.length === 0) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (group[0].visibility === 'private') {
            return res.status(403).json({ message: 'Cannot join private group' });
        }

        // Check if already a member
        const [existing] = await pool.query(
            'SELECT 1 FROM group_members WHERE group_id = ? AND username = ?',
            [groupId, username]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Already a member of this group' });
        }

        // Add user to group
        await pool.query(
            'INSERT INTO group_members (group_id, username) VALUES (?, ?)',
            [groupId, username]
        );

        res.json({ message: 'Successfully joined group' });
    } catch (error) {
        console.error('Error joining group:', error);
        res.status(500).json({ message: 'Error joining group' });
    }
});

module.exports = router; 
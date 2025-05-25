const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Akki@2006',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

async function initializeDatabase() {
    try {
        // Create connection without database selected
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });

        // Create database if it doesn't exist
        await connection.query('CREATE DATABASE IF NOT EXISTS learning_hub');
        console.log('Database created successfully');
        
        // Use the database
        await connection.query('USE learning_hub');

        // Create users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Users table created successfully');

        // Create courses table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS courses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                platform VARCHAR(255),
                link VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_username (username)
            )
        `);
        console.log('Courses table created successfully');

        // Create notes table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS notes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                course_id INT,
                category VARCHAR(50),
                tags JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_username (username),
                INDEX idx_course (course_id),
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
            )
        `);
        console.log('Notes table created successfully');

        // Create bookmarks table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS bookmarks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                title VARCHAR(255) NOT NULL,
                url TEXT NOT NULL,
                description TEXT,
                category VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_username (username)
            )
        `);
        console.log('Bookmarks table created successfully');

        // Create reminders table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS reminders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                title VARCHAR(255) NOT NULL,
                datetime DATETIME NOT NULL,
                description TEXT,
                completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_username (username)
            )
        `);
        console.log('Reminders table created successfully');

        // Create study_groups table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS study_groups (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                visibility ENUM('public', 'private') DEFAULT 'public',
                owner_username VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (owner_username) REFERENCES users(username) ON DELETE CASCADE,
                INDEX idx_visibility (visibility),
                INDEX idx_owner (owner_username)
            )
        `);
        console.log('Study groups table created successfully');

        // Create group_members table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS group_members (
                group_id INT NOT NULL,
                username VARCHAR(255) NOT NULL,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (group_id, username),
                FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE,
                FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
                INDEX idx_username (username)
            )
        `);
        console.log('Group members table created successfully');

        // Create group_tags table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS group_tags (
                group_id INT NOT NULL,
                tag VARCHAR(50) NOT NULL,
                PRIMARY KEY (group_id, tag),
                FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE,
                INDEX idx_tag (tag)
            )
        `);
        console.log('Group tags table created successfully');

        // Create messages table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                group_id INT NOT NULL,
                username VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE,
                FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
                INDEX idx_group (group_id),
                INDEX idx_username (username),
                INDEX idx_created_at (created_at)
            )
        `);
        console.log('Messages table created successfully');

        // Create platforms table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS platforms (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                platform_name VARCHAR(100) NOT NULL,
                platform_url TEXT NOT NULL,
                category ENUM('coding', 'professional', 'learning', 'documentation', 'ai_tools') NOT NULL,
                is_favorite BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_username (username),
                INDEX idx_category (category),
                FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
            )
        `);
        console.log('Platforms table created successfully');

        // Create user_platform_favorites table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS user_platform_favorites (
                username VARCHAR(255) NOT NULL,
                platform_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (username, platform_id),
                FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
                FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE
            )
        `);
        console.log('User platform favorites table created successfully');

        // Insert default platforms
        const defaultPlatforms = [
            // Coding Platforms
            ['coding', 'LeetCode', 'https://leetcode.com'],
            ['coding', 'CodeChef', 'https://codechef.com'],
            ['coding', 'Codeforces', 'https://codeforces.com'],
            ['coding', 'GeeksforGeeks', 'https://geeksforgeeks.org'],
            ['coding', 'HackerRank', 'https://hackerrank.com'],
            ['coding', 'AtCoder', 'https://atcoder.jp'],
            
            // Professional Networks
            ['professional', 'LinkedIn', 'https://linkedin.com'],
            ['professional', 'GitHub', 'https://github.com'],
            ['professional', 'Kaggle', 'https://kaggle.com'],
            ['professional', 'ResearchGate', 'https://researchgate.net'],
            
            // Learning Platforms
            ['learning', 'Udemy', 'https://udemy.com'],
            ['learning', 'Coursera', 'https://coursera.org'],
            ['learning', 'edX', 'https://edx.org'],
            ['learning', 'Khan Academy', 'https://khanacademy.org'],
            ['learning', 'MIT OpenCourseWare', 'https://ocw.mit.edu'],
            
            // Documentation & AI Tools
            ['documentation', 'Stack Overflow', 'https://stackoverflow.com'],
            ['documentation', 'W3Schools', 'https://w3schools.com'],
            ['documentation', 'MDN Web Docs', 'https://developer.mozilla.org'],
            ['ai_tools', 'ChatGPT', 'https://chat.openai.com'],
            ['ai_tools', 'Google Bard', 'https://bard.google.com']
        ];

        // Insert default platforms for admin user
        await connection.query(`
            INSERT IGNORE INTO users (username, email, password) 
            VALUES ('admin', 'admin@learninghub.com', '$2b$10$your_hashed_password_here')
        `);

        for (const [category, name, url] of defaultPlatforms) {
            await connection.query(`
                INSERT IGNORE INTO platforms (username, platform_name, platform_url, category) 
                VALUES ('admin', ?, ?, ?)
            `, [name, url, category]);
        }

        await connection.end();
        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Please check your MySQL credentials and make sure:');
            console.error('1. MySQL is running');
            console.error('2. The root password is correct');
            console.error('3. The user has proper permissions');
        }
        process.exit(1);
    }
}

// Run initialization
initializeDatabase();

module.exports = initializeDatabase; 
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

async function resetDatabase() {
    try {
        // Create connection without database selected
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });

        // Drop database if it exists
        await connection.query('DROP DATABASE IF EXISTS learning_hub');
        console.log('Database dropped successfully');
        
        // Create database
        await connection.query('CREATE DATABASE learning_hub');
        console.log('Database created successfully');
        
        // Use the database
        await connection.query('USE learning_hub');

        // Create users table
        await connection.query(`
            CREATE TABLE users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Users table created successfully');

        // Create courses table
        await connection.query(`
            CREATE TABLE courses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                title VARCHAR(255) NOT NULL,
                link TEXT NOT NULL,
                platform VARCHAR(50) NOT NULL,
                category VARCHAR(50) NOT NULL,
                difficulty VARCHAR(50) NOT NULL,
                priority VARCHAR(50) NOT NULL,
                status VARCHAR(50) NOT NULL,
                tags JSON,
                notes TEXT,
                progress INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_username (username)
            )
        `);
        console.log('Courses table created successfully');

        // Create notes table
        await connection.query(`
            CREATE TABLE notes (
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
            CREATE TABLE bookmarks (
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

        await connection.end();
        console.log('Database reset completed successfully');
    } catch (error) {
        console.error('Error resetting database:', error);
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Please check your MySQL credentials and make sure:');
            console.error('1. MySQL is running');
            console.error('2. The root password is correct');
            console.error('3. The user has proper permissions');
        }
        process.exit(1);
    }
}

// Run reset
resetDatabase(); 
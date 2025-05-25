const mysql = require('mysql2/promise');

const config = {
    host: 'localhost',
    user: 'root',
    password: 'Akki@2006',
    database: 'learning_hub',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create a connection pool
const pool = mysql.createPool(config);

// Test the connection
pool.getConnection()
    .then(connection => {
        console.log('Successfully connected to MySQL database');
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to MySQL database:', err);
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Please check your MySQL credentials');
        }
    });

module.exports = pool; 
const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Akki@2006',
    database: 'learning_hub',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

async function resetData() {
    let connection;
    try {
        // Create connection
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database successfully');

        // Disable foreign key checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        console.log('Foreign key checks disabled');

        // Get all tables in the database
        const [tables] = await connection.query('SHOW TABLES');
        
        // Truncate each table
        for (const table of tables) {
            const tableName = Object.values(table)[0];
            await connection.query(`TRUNCATE TABLE ${tableName}`);
            console.log(`Cleared data from table: ${tableName}`);
        }

        // Re-enable foreign key checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Foreign key checks re-enabled');

        console.log('Database reset completed successfully!');
    } catch (error) {
        console.error('Error resetting database:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed');
        }
    }
}

// Run the reset function
resetData(); 
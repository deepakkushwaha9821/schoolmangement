// db.js
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',       // Default XAMPP MySQL user
    password: '',       // Default XAMPP MySQL password (usually empty)
    database: 'school_management',
    port: 3306          // Ensure the port matches the one set in XAMPP
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to the database');
    }
});

module.exports = connection;

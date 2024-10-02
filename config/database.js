// my-b2b-app/config/database.js

const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "0ARYQg55,xyz@123",
  database: process.env.DB_NAME || "partnercenter_connex_v2",
  waitForConnections: true,
  connectionLimit: 10, // You can adjust the connection limit based on your requirements
  queueLimit: 0 // No limit to the number of queries that can be queued
});

// Check the pool connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database via pool');
  connection.release(); // Release the connection back to the pool
});

// Export the pool
module.exports = pool;

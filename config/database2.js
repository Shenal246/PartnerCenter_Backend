// my-b2b-app/config/database.js

const mysql = require('mysql2');
require('dotenv').config();

// Create a single database connection
const db = mysql.createConnection({
  // host: process.env.DB_HOST,
  // user: process.env.DB_USER,
  // password: process.env.DB_PASSWORD,
  // database: process.env.DB_NAME
  host: "localhost",
  user: "root",
  password: "",
  database: "connexdb"
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// Export the database connection
module.exports = db;

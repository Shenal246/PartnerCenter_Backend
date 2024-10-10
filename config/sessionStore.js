// config/sessionStore.js
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const pool = require('./database');

const sessionStore = new MySQLStore({}, pool.promise());

module.exports = sessionStore;

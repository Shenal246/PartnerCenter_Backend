// utils/jwtUtils.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const signToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

module.exports = { signToken, verifyToken };

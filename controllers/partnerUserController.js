const bcrypt = require('bcrypt');
const db = require('../config/database');
const { errorHandler } = require('../middlewares/errorHandler');

// Compare password with the stored hashed password
async function comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await db.promise().query(
            'SELECT id, password FROM partner_user WHERE username = ?',
            [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const user = rows[0];

        const match = await comparePassword(password, user.password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        req.session.user = {
            id: user.id,
            username
        };

        await db.promise().query(
            'INSERT INTO partnerlogs (timestamp, action, partner_user_id) VALUES (NOW(), ?, ?)',
            ['PartnerCenter Login', user.id]
        );

        const token = jwt.sign({ id: user.id, username }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'Strict' });

        res.status(200).json({ message: 'Login successful', token });

    } catch (err) {
        console.error('Error during login:', err);
        errorHandler(err, req, res);
    }
};

// Logout function
exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logout successful' });
    });
};

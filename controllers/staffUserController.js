const bcrypt = require('bcrypt');
const db = require('../config/database');
const { errorHandler } = require('../middlewares/errorHandler');
const jwt = require('jsonwebtoken');
const jwtUtils = require('../utils/jwtUtils');


// Compare password with the stored hashed password
async function comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

// Login function
exports.login = async (req, res) => {
    const { username, password, portalID } = req.body;


    try {
        const [rows] = await db.promise().query(
            'SELECT id, password, is_password_changed, portal_id, staff_id FROM staff_user WHERE username = ?',
            [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const user = rows[0];

        if (!(user.portal_id === portalID)) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Check User status
        const [userdata] = await db.promise().query(
            'SELECT id, status_id FROM staff WHERE id = ?',
            [user.staff_id]
        );

        if (userdata[0].status_id === 2) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Check if the user has changed their password
        if (!user.is_password_changed) {

            // Generate a temporary token with limited permissions
            const tempToken = jwt.sign(
                { id: user.id, username, firstLogin: true },
                process.env.JWT_SECRET,
                { expiresIn: '15m' } // Token expires in 15 minutes
            );

            // Provide a flag in the response to indicate that a password change is required
            return res.status(200).json({ message: 'Password change required', firstLogin: true, tempToken });
        }

        await db.promise().query(
            'INSERT INTO stafflogs (timestamp, action, staff_user_id) VALUES (NOW(), ?, ?)',
            ['Staff Login', user.id]
        );

        const token = jwt.sign({ id: user.id, username, portalID }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200)
            .cookie('token', token,
                {
                    httpOnly: true,
                    secure: false, // Set to true if using HTTPS
                    sameSite: 'Lax', // Necessary for cross-site requests
                    // expires: new Date(new Date().getTime() + 60 * 60 * 1000),
                    maxAge: 172800000,
                })
        // .send("Cookie being Initialized, Login successful");

        res.status(200).json({ message: 'Login successful', user: { id: user.id, email: user.email }, });

    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Server error' });
        // errorHandler(err, req, res);
    }
};


// Change password function
exports.changePassword = async (req, res) => {
    const { userId, newPassword } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.promise().query(
            'UPDATE staff_user SET password = ?, is_password_changed = TRUE WHERE id = ?',
            [hashedPassword, userId]
        );

        await db.promise().query(
            'INSERT INTO stafflogs (timestamp, action, staff_user_id) VALUES (NOW(), ?, ?)',
            ['First Login Password Change Required', userId]
        );

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error('Error changing password:', err);
        // errorHandler(err, req, res);
    }
};

// Logout function
exports.logout = (req, res) => {

    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
};


//staff details
exports.getUserDetails = async (req, res) => {
    const token = req.cookies.token;

    try {
        // Verify the token
        const decoded = jwtUtils.verifyToken(token);
        req.user = decoded; // Attach decoded token data to req.user

        // Fetch user details from the staff_user table
        const [staff_user] = await db.promise().query(
            'SELECT * FROM staff_user WHERE id = ?',
            [req.user.id]
        );

        // Check if staff_user is found
        if (staff_user.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch additional details from the staff table
        const [staff] = await db.promise().query(
            'SELECT * FROM staff WHERE id = ?',
            [staff_user[0].id] // Use the id of the fetched staff_user
        );

        // Check if staff details are found
        if (staff.length === 0) {
            return res.status(404).json({ message: 'Staff details not found' });
        }

        // Return the combined staff details
        res.status(200).json(staff[0]);

    } catch (err) {
        console.error('Error fetching user details:', err.message);
        res.status(401).json({ message: 'Unauthorized access' });
    }
};

// Get privileges
exports.getPrivilegesFunctionforstaff = async (req, res) => {
    try {

        const query = `
            SELECT su.username, sr.name AS RoleName, GROUP_CONCAT(sm.name) AS Privileges
            FROM staff_user su
            JOIN staff_role sr ON su.role_id = sr.id
            JOIN staff_privilege sp ON sr.id = sp.staff_role_id
            JOIN staff_module sm ON sp.staff_module_id = sm.id
            WHERE su.id = 6
            GROUP BY su.username, sr.name;
        `;

        const result = await db.promise().query(query);  // db.query() should be your configured database query function
        res.json(result[0][0]);
    } catch (err) {
        console.error('Error getting privileges:', err);
        res.status(500).send('Failed to retrieve privileges');
    }
};



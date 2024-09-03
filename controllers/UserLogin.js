const bcrypt = require('bcrypt');
const pool = require('../config/database');
const { errorHandler } = require('../middlewares/errorHandler');
const jwt = require('jsonwebtoken');

// Compare password with the stored hashed password
async function comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

// Login function
exports.login = async (req, res) => {
    const { username, password, country } = req.body;

    try {
        // Extract cnt from the request body
        pool.query(`SELECT * FROM users WHERE username = ? AND cnt = ? and status = 'active'`, [username, country], async (error, results) => {
            if (error) {
                console.log(error);
                res.status(500).send('Server Error');
            } else if (results.length > 0) {
                const match = await bcrypt.compare(password, results[0].password);
                if (match) {
                    const token = jwt.sign({ username: results[0].username }, 'secret_key');
                    console.log("Logged country:" + country);

                    res.cookie('token', token,
                            {
                                httpOnly: true,
                                secure: false, // Set to true if using HTTPS
                                sameSite: 'Lax', // Necessary for cross-site requests
                                // expires: new Date(new Date().getTime() + 60 * 60 * 1000),
                                maxAge: 172800000,
                            })
                            res.j
                    // .send("Cookie being Initialized, Login successful");

                    res.status(200).json({ message: 'Login successful',cnt:country,usn: results[0].id,});
                } else {
                    res.status(401).send('Invalid username or password');
                }
            } else {
                res.status(401).send('User not found or incorrect country code');
            }
        });

    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Server error' });
        // errorHandler(err, req, res);
    }
};


// Change password function
// Assume you are using bcrypt for hashing passwords


exports.changePassword = async (req, res) => {
    const cnt = req.headers.cnt;
    const pass = req.headers.pass;
   // Assuming you're using an authentication middleware that sets req.user
  const { password } = req.body;
console.log(pass,cnt);
  if (!pass) {
    return res.status(400).json({ message: 'Password is required' });
  }

  try {
    // Hash the new password
    

    // Update the password in the database
    const [result] = await pool.promise().query('UPDATE users SET password = ? WHERE id = ?', [pass, cnt]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error updating password:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Logout function
exports.logout = (req, res) => {

    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
};
exports.getUserinfo = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.promise().query(`SELECT * FROM users WHERE id = ? and status = 'active'`, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = rows[0]; // Assuming only one user is returned

        // Convert the image buffer to a base64 string, if the image exists
        if (user.image) {
            const mimeType = 'image/jpeg'; // or 'image/png' depending on the image type stored
            user.imageData = `data:${mimeType};base64,${user.image.toString('base64')}`;
        } else {
            user.imageData = null; // Handle case when there is no image
        }

        res.status(200).json(user); // Return the user object with the imageData field
    } catch (err) {
        console.error("Error fetching user details:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
};


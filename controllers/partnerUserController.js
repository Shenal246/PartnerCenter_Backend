const bcrypt = require('bcrypt');
const db = require('../config/database');
const { errorHandler } = require('../middlewares/errorHandler');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');


// Login function
exports.login = async (req, res) => {
    const { username, password, portalID } = req.body;

    try {
        const [rows] = await db.promise().query(
            'SELECT id, password, is_password_changed, portal_id, partner_id FROM partner_user WHERE username = ?',
            [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const user = rows[0];

        if (!(user.portal_id === portalID)) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Check Partner status
        const [userdata] = await db.promise().query(
            'SELECT id, status_id FROM partner WHERE id = ?',
            [user.partner_id]
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
            'INSERT INTO partnerlogs (timestamp, action, partner_user_id) VALUES (NOW(), ?, ?)',
            ['partner Login', user.id]
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
            'UPDATE partner_user SET password = ?, is_password_changed = TRUE WHERE id = ?',
            [hashedPassword, userId]
        );

        await db.promise().query(
            'INSERT INTO partnerlogs (timestamp, action, partner_user_id) VALUES (NOW(), ?, ?)',
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

// Get User Details
exports.getUserDetails = async (req, res) => {

    try {
        // Query to get the partner_id based on partner_user_id (which is req.user.id)
        const [partnerResult] = await db.promise().query('SELECT partner_id FROM partner_user WHERE id = ?', [req.user.id]);

        if (partnerResult.length === 0) {
            return res.status(404).json({ message: 'Partner not found for the user.' });
        }

        const partner_id = partnerResult[0].partner_id;




        const rows = await db.promise().query(
            `SELECT name,email,mobileno FROM partner WHERE id=?`, [partner_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User account not found for the user.' });
        }


        res.status(200).json({ rows });
    } catch (err) {
        console.error('Error:', err);
        // errorHandler(err, req, res);
    }
};

// Get Company members
exports.getCompanymembers = async (req, res) => {

    try {

        // Fetch partner's company_id using partner's user id
        const [partnerResult] = await db.promise().query(
            `SELECT partner.company_id 
         FROM partner 
         JOIN partner_user pu ON partner.id = pu.partner_id 
         WHERE pu.id = ?`,
            [req.user.id]
        );

        if (partnerResult.length === 0) {
            return res.status(404).json({ message: 'Partner not found' });
        }

        const companyId = partnerResult[0].company_id;

        // Fetch company members
        const [companymembers] = await db.promise().query(
            `SELECT name, photo, designation 
         FROM partner
         WHERE company_id = ?`,
            [companyId]
        );

        if (companymembers.length === 0) {
            return res.status(404).json({ message: 'Company members not found' });
        }

        res.status(200).json({ companymembers });
    } catch (err) {
        console.error('Error changing password:', err);
        // errorHandler(err, req, res);
    }
};

// Get privileges
exports.getPrivilegesFunctionforpartner = async (req, res) => {
    try {

        const result = await db.promise().query(`
            SELECT su.username,  GROUP_CONCAT(sm.name) AS Privileges
            FROM partner_user su
            JOIN partner_privilege sp ON su.id = sp.partner_user_id
            JOIN partner_module sm ON sp.partner_module_id = sm.id
            WHERE su.id = ?
            GROUP BY su.username;
        `, [req.user.id]);  // db.query() should be your configured database query function
        res.json(result[0][0]);
    } catch (err) {
        console.error('Error getting privileges:', err);
        console.log(err);

        res.status(500).send('Failed to retrieve privileges');
    }
};

// Get Company members
exports.getCompanymembersForAccessManagement = async (req, res) => {

    try {

        // Fetch partner's company_id using partner's user id
        const [partnerResult] = await db.promise().query(
            `SELECT partner.company_id 
         FROM partner 
         JOIN partner_user pu ON partner.id = pu.partner_id 
         WHERE pu.id = ?`,
            [req.user.id]
        );

        if (partnerResult.length === 0) {
            return res.status(404).json({ message: 'Partner not found' });
        }

        const companyId = partnerResult[0].company_id;

        // Fetch company members
        const [companymembers] = await db.promise().query(
            `SELECT 
                p.id,
                p.name, 
                p.photo, 
                p.email, 
                p.mobileno, 
                p.whatsappno, 
                p.designation, 
                s.name AS status,
                GROUP_CONCAT(pm.id SEPARATOR ', ') AS modules
            FROM partner p
            LEFT JOIN status s ON p.status_id = s.id
            LEFT JOIN partner_user pu ON pu.partner_id = p.id
            LEFT JOIN partner_privilege pp ON pu.id = pp.partner_user_id
            LEFT JOIN partner_module pm ON pp.partner_module_id = pm.id
            WHERE 
                p.company_id = ?
            GROUP BY
                p.id;`,
            [companyId]
        );

        if (companymembers.length === 0) {
            return res.status(404).json({ message: 'Company members not found' });
        }

        res.status(200).json(companymembers);
    } catch (err) {
        console.error('Error changing password:', err);
        // errorHandler(err, req, res);
    }
};

// Backend Function to Add a New Partner to the Same Company
exports.addnewpartnertosamecompany = async (req, res, next) => {

    const connection = await db.promise().getConnection();
    try {
        if (!req.body || !req.file) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const { name, email, mobileno, whatsappno, designation, status, modules } = req.body;
        const imagePath = `/uploads/partner/${req.file ? req.file.filename : null}`;

        // Parse the modules string into an array
        let parsedModules = [];
        try {
            parsedModules = JSON.parse(modules); // Parse the incoming JSON string
        } catch (parseError) {
            return res.status(400).json({ message: 'Invalid modules format. Expected a JSON array.' });
        }

        // Fetch partner's company_id using partner's user id
        const [partnerResult] = await db.promise().query(
            `SELECT partner.company_id 
     FROM partner 
     JOIN partner_user pu ON partner.id = pu.partner_id 
     WHERE pu.id = ?`,
            [req.user.id]
        );

        if (partnerResult.length === 0) {
            return res.status(404).json({ message: 'Partner not found' });
        }

        const companyId = partnerResult[0].company_id;

        // Check if the partner already exists using the combination of company_id and email
        const [existingPartner] = await db.promise().query(
            `SELECT id FROM partner WHERE company_id = ? AND email = ?`,
            [companyId, email]
        );

        if (existingPartner.length > 0) {
            return res.status(409).json({ message: 'Partner with this email already exists in the company.' });
        }

        // Start a transaction to ensure atomicity
        const connection = await db.promise().getConnection();
        await connection.beginTransaction();

        const [insertResult] = await connection.query(
            `INSERT INTO partner (name, email, mobileno, whatsappno, designation, status_id, company_id, photo, country_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)`,
            [name, email, mobileno, whatsappno, designation, status, companyId, imagePath, 1] // Assuming 'status_id' is the status
        );

        const newPartnerId = insertResult.insertId;

        // Generate a random password for the new partner user
        const plainPassword = crypto.randomBytes(8).toString("hex");
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const [partnerUserResult] = await connection.query(
            `INSERT INTO partner_user (username, password, partner_id, portal_id) VALUES (?, ?, ?, ?)`,
            [email, hashedPassword, newPartnerId, 1] // Assuming portal_id and role_id are predefined (adjust as needed)
        );

        const newPartnerUserId = partnerUserResult.insertId;

        // Insert each module into the `partner_privilege` table with the new `partner_user` ID
        for (const moduleId of parsedModules) {
            await connection.query(
                `INSERT INTO partner_privilege (partner_module_id, partner_user_id) VALUES (?, ?)`,
                [moduleId, newPartnerUserId]
            );
        }

        // Commit the transaction
        await connection.commit();
        connection.release();

        // Send an email to the partner with the login details
        const transporter = nodemailer.createTransport({
            host: "smtp-mail.outlook.com",
            port: 587,
            secure: false, // Use TLS
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
            tls: {
                ciphers: "SSLv3",
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: "Your New Partner Account Details",
            html: `
                <html>
                <head>
                  <style>
                    body {
                      font-family: Arial, sans-serif;
                      background-color: #f4f4f4;
                      margin: 0;
                      padding: 0;
                    }
                    .email-container {
                      max-width: 600px;
                      margin: 20px auto;
                      background: #ffffff;
                      padding: 20px;
                      border-radius: 8px;
                      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    }
                    .header {
                      background-color: #4CAF50;
                      color: #ffffff;
                      padding: 10px;
                      text-align: center;
                      border-top-left-radius: 8px;
                      border-top-right-radius: 8px;
                    }
                    .content {
                      padding: 20px;
                      text-align: center;
                      line-height: 1.6;
                    }
                    .footer {
                      text-align: center;
                      padding: 10px;
                      font-size: 12px;
                      color: #777;
                    }
                    .button {
                      display: inline-block;
                      padding: 10px 20px;
                      margin: 20px 0;
                      background-color: #0056b3;
                      color: #ffffff;
                      text-decoration: none;
                      border-radius: 5px;
                      font-weight: bold;
                    }
                  </style>
                </head>
                <body>
                  <div class="email-container">
                    <div class="header">
                      Welcome to the Partner Portal!
                    </div>
                    <div class="content">
                      <h1>Welcome, ${name}!</h1>
                      <p>Your account has been created successfully. Below are your login details:</p>
                      <p><strong>Username:</strong> ${email}</p>
                      <p><strong>Password:</strong> ${plainPassword}</p>
                      <a href="https://partneradminportal.connexit.biz/" class="button">Login Now</a>
                      <p>Please change your password after logging in for security purposes.</p>
                    </div>
                    <div class="footer">
                      This is an automated message, please do not reply directly to this email. For assistance, contact our support team.
                    </div>
                  </div>
                </body>
                </html>
            `,
        };

        await transporter.sendMail(mailOptions);

        // Respond with success and include the newly created partner's ID

        // Send a dummy response for now to verify the logging
        res.status(200).json({ message: "Data logged successfully", data: req.body });
    } catch (err) {
        await connection.rollback();
        connection.release();
        // Error Handling: Log the error and respond
        console.error("Error occurred while logging data:", err);
        res.status(500).json({ error: err.message });
    }
};


// For fetch all modules
exports.fetchmodules = async (req, res, next) => {
    try {
        // Fetch partner's company_id using partner's user id
        const [partnerResult] = await db.promise().query(
            `SELECT * from partner_module`
        );

        if (partnerResult.length === 0) {
            return res.status(404).json({ message: 'Partner modules not found' });
        }

        res.status(200).json(partnerResult);
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log(err);

    }
};

// Update Partner and Privileges
exports.updatePartnerAndPrivileges = async (req, res) => {
    const { id } = req.params;
    const { ids, name, email, mobileno, whatsappno, designation, status, modules } = req.body;

    if (!id) {
        return res.status(400).json({ message: "Partner ID is required." });
    }

    // Convert status to corresponding status_id
    const statusId = status === 'Enable' ? 1 : 2;

    const connection = await db.promise().getConnection(); // Get DB connection for transactions

    try {
        // console.log(id, "--", name, "--", email, "--", mobileno, "--", whatsappno, "--", designation, "--", statusId, "--", modules);
        //       // Print type and content of modules for debugging
        //       console.log("Modules Type:", typeof modules);
        //       console.log("Modules Content:", modules);
      
              // Ensure modules is an array
              let moduleIds = Array.isArray(modules) ? modules : JSON.parse(modules);

        // Start the transaction
        await connection.beginTransaction();

        // Step 1: Update Partner details
        const [updatePartnerResult] = await connection.query(
            `UPDATE partner 
                 SET name = ?, mobileno = ?, whatsappno = ?, designation = ?, status_id = ? 
                 WHERE id = ?`,
            [name, mobileno, whatsappno, designation, statusId, id]
        );

        if (updatePartnerResult.affectedRows === 0) {
            throw new Error("Failed to update partner information.");
        }

        // Step 2: Fetch Partner User ID (Assuming each partner has a partner_user relationship)
        const [partnerUserResult] = await connection.query(
            `SELECT pu.id AS partner_user_id 
                 FROM partner_user pu 
                 WHERE pu.partner_id = ?`,
            [id]
        );

        if (partnerUserResult.length === 0) {
            throw new Error("Partner user not found.");
        }

        const partnerUserId = partnerUserResult[0].partner_user_id;

        // Step 3: Remove all existing privileges for this partner user
        await connection.query(
            `DELETE FROM partner_privilege WHERE partner_user_id = ?`,
            [partnerUserId]
        );

        // Step 4: Insert new privileges based on the provided module IDs
        if (moduleIds && moduleIds.length > 0) {
            const privilegeValues = moduleIds.map((moduleId) => [partnerUserId, moduleId]);
            await connection.query(
                `INSERT INTO partner_privilege (partner_user_id, partner_module_id) VALUES ?`,
                [privilegeValues]
            );
        }

        // Commit the transaction
        await connection.commit();

        res.status(200).json({ message: "Partner and privileges updated successfully." });
    } catch (error) {
        // Rollback the transaction in case of any error
        await connection.rollback();
        console.error("Error updating partner and privileges:", error);
        res.status(500).json({ message: "Failed to update partner and privileges.", error: error.message });
    } finally {
        // Release the DB connection
        connection.release();
    }
};


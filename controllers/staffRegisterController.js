// my-b2b-app/controllers/companyController.js
const db = require('../config/database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

exports.staffRegister = async (req, res) => {
  const { staffId, portalId, roleId } = req.body;

  try {
    // Fetch staff details from staff table
    const [staffData] = await db.promise().query(`
            SELECT * FROM staff WHERE id = ?
        `, [staffId]);

    if (staffData.length === 0) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    const staff = staffData[0];

    // Check if the company with the given BR number already exists
    const [existingStaffAccount] = await db.promise().query(`
            SELECT id FROM staff_user WHERE staff_id = ?
        `, [staffId]);

    if (existingStaffAccount.length > 0) {
      return res.status(210).json({ message: 'Staff account for this User is Already exists' });
    }

    // Generate a random password and hash it with salt
    const plainPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(plainPassword, 10); // 10 is the salt rounds

    // Insert partner user data into the partner_user table
    await db.promise().query(`
            INSERT INTO staff_user 
            (username, password, staff_id, portal_id, role_id)
            VALUES (?, ?, ?, ?, ?)
        `, [
      staff.email, hashedPassword, staffId, portalId, roleId // Assuming portal_id and role_id are fixed values
    ]);

    let transporter = nodemailer.createTransport({
      host: "smtp-mail.outlook.com",  // Outlook SMTP server
      port: 587,                     // SMTP port for Outlook
      secure: false,                 // true for 465 (SSL), false for other ports like 587 (TLS)
      auth: {
        user: process.env.EMAIL_USERNAME,  // Your Outlook email address
        pass: process.env.EMAIL_PASSWORD      // Your Outlook password
      },
      tls: {
        ciphers: 'SSLv3'
      }
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: staff.email,
      subject: 'Your Account Password - Connex Staff Portal',
      html: `
    <html>
    <head>
      <style>
        body {
          font-family: 'Arial', sans-serif;
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
          background-color: #007bff; /* Blue shade */
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
          background-color: #28a745; /* Green shade */
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          Connex Staff Portal - Welcome!
        </div>
        <div class="content">
          <h1>Welcome to Your Connex Staff Account!</h1>
          <p>Your account has been created successfully. Below is your initial password:</p>
          <p><b>${plainPassword}</b></p>
          <p>Please change your password after logging in to ensure your account's security.</p>
        </div>
        <div class="footer">
          This is an automated message, please do not reply directly to this email. For assistance, please contact our support.
        </div>
      </div>
    </body>
    </html>
  `
    };


    // Sending the email
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        res.status(500).json({ message: 'Error sending password email', error: error });
      } else {
        console.log('Email sent: ' + info.response);
        res.status(201).json({
          message: 'Staff Account Created successfully and password sent via email',
          email: staff.email
        });
      }
    });

  } catch (err) {
    console.error('Error registering company, director, and partner user:', err);
    errorHandler(err, req, res);
  }
};

// Error handler middleware function (basic example)
const errorHandler = (err, req, res, next) => {
  res.status(500).json({ message: 'Internal server error', error: err.message });
};

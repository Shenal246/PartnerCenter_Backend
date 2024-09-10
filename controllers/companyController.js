// my-b2b-app/controllers/companyController.js
const db = require('../config/database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

exports.registerPartnerCompany = async (req, res) => {
  const { id, password } = req.body;

  const partnerId = id;

  if (!partnerId || !password) {
    return res.status(400).json({ message: 'Partner ID and password are required' });
  }

  try {

    // Check password
    const [getuser] = await db.promise().query(`
      SELECT * FROM staff_user WHERE id = ?
  `, [req.user.id]);

    if (getuser.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const match = await bcrypt.compare(password, getuser[0].password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }


    // Fetch partner details from the become_a_partner table
    const [partnerData] = await db.promise().query(`
            SELECT * FROM become_a_partner WHERE id = ?
        `, [partnerId]);

    if (partnerData.length === 0) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    const partner = partnerData[0];

    // Check if the company with the given BR number already exists
    const [existingCompany] = await db.promise().query(`
            SELECT id FROM company WHERE company_brno = ?
        `, [partner.company_brno]);

    if (existingCompany.length > 0) {
      return res.status(210).json({ message: 'A company with this BR number already exists.' });
    }

    // Insert data into the company table
    const [insertResult] = await db.promise().query(`
            INSERT INTO company 
            (company_name, company_address, company_city, company_website, company_telephone, 
            company_email, company_whatsapp, company_brno, company_vatno, company_br, company_vat,
            date, companycountry_id, status_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
      partner.company_name, partner.company_address, partner.company_city, partner.company_website,
      partner.company_mobile, partner.company_email, partner.company_wtsapp, partner.company_brno,
      partner.company_vatno, partner.company_br, partner.company_vat, new Date(), partner.companycountry_id, 1
    ]);

    const companyId = insertResult.insertId;

    // Check if a director with the given email already exists
    const [existingDirector] = await db.promise().query(`
            SELECT id FROM partner WHERE email = ?
        `, [partner.directoremail]);

    if (existingDirector.length > 0) {
      return res.status(210).json({ message: 'A director with this email already exists.' });
    }

    // Insert director details into the partner table
    const [directorResult] = await db.promise().query(`
            INSERT INTO partner 
            (name, email, mobileno, designation, company_id, country_id, status_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
      partner.directorname, partner.directoremail, partner.directormobile, 'Director',
      companyId, partner.companycountry_id, 1
    ]);

    const directorPartnerId = directorResult.insertId;

    // Generate a random password and hash it with salt
    const plainPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(plainPassword, 10); // 10 is the salt rounds

    // Insert partner user data into the partner_user table
    await db.promise().query(`
            INSERT INTO partner_user 
            (username, password, partner_id, portal_id, role_id)
            VALUES (?, ?, ?, ?, ?)
        `, [
      partner.directoremail, hashedPassword, directorPartnerId, 1, 1 // Assuming portal_id and role_id are fixed values
    ]);

    // Change the become a partner status
    await db.promise().query(
      'UPDATE become_a_partner SET becomestatus_id = ?, approvedby_id = ? WHERE id = ?',
      [2 , req.user.id, partnerId]
    );

    await db.promise().query(
      'INSERT INTO stafflogs (timestamp, action, staff_user_id) VALUES (NOW(), ?, ?)',
      [`Registered a new partner: BR No = ${partner.company_brno}`, req.user.id]
    );

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
      to: partner.directoremail,
      subject: 'Your New Account Password for Connex Partner Center',
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
          Connex Partner Portal - Welcome!
        </div>
        <div class="content">
          <h1>Welcome to Connex Partner Center!</h1>
          <p>Your account has been created successfully. Below is your initial password:</p>
          <p><b>${plainPassword}</b></p>
          <a href="https://partneradminportal.connexit.biz/" class="button">Login Now</a>
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
        return res.status(500).json({ message: 'Error sending password email', error: error });
      }
      console.log('Email sent: ' + info.response);
      res.status(200).json({
        message: 'Company, director, and partner user registered successfully, password sent via email',
      });
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

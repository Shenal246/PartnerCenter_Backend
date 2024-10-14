// my-b2b-app/controllers/companyController.js
const db = require('../config/database');
const bcrypt = require('bcrypt');
const { log } = require('console');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { AuthorizationCode } = require('simple-oauth2');

const oauth2Client = new AuthorizationCode({
  client: {
    id: '8c85fd32-5856-461f-95f4-778df292167f',
    secret: 'aa98e47e-73a3-496b-a644-dc5af9f6f0b1',
  },
  auth: {
    tokenHost: 'https://login.microsoftonline.com',
    tokenPath: 'p2i8Q~e6OfWxVbEHWyt77hflYZQdwpdoebMjHai7/oauth2/v2.0/token',
    authorizePath: 'p2i8Q~e6OfWxVbEHWyt77hflYZQdwpdoebMjHai7/oauth2/v2.0/authorize',
  },
  options: {
    authorizationMethod: 'body'
  },
});


async function getToken() {
  try {
    const tokenConfig = {
      scope: 'https://outlook.office.com/SMTP.Send',
    };
    const result = await oauth2Client.getToken(tokenConfig.scope);
    return result.token;
  } catch (error) {
    console.error('Access Token Error', error.message);
    return null;
  }
}


async function getTransporter() {
  const accessToken = await getToken();
  if (!accessToken) {
    throw new Error('Failed to retrieve access token');
  }

  return nodemailer.createTransport({
    service: 'Outlook365', // This automatically uses Outlook SMTP settings
    auth: {
      type: 'OAuth2',
      user: 'partnerinfo@connexit.biz',
      clientId: '8c85fd32-5856-461f-95f4-778df292167f',
      clientSecret: 'aa98e47e-73a3-496b-a644-dc5af9f6f0b1',
      //refreshToken: accessToken.refresh_token, // Handle refresh token securely
      accessToken: accessToken.access_token,
      expires: accessToken.expires_at.getTime(),
    },
  });
}


exports.registerPartnerCompany = async (req, res) => {
  const { id, password, category } = req.body;
  const partnerId = id;

  if (!partnerId || !password) {
    return res.status(400).json({ message: 'Partner ID and password are required' });
  }

  const connection = await db.promise().getConnection();

  try {
    // Start transaction
    await connection.beginTransaction();

    // Authenticate the user first
    const [getuser] = await connection.query(
      `SELECT * FROM staff_user WHERE id = ?`, [req.user.id]
    );

    if (getuser.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ message: 'User not found' });
    }

    const match = await bcrypt.compare(password, getuser[0].password);
    if (!match) {
      await connection.rollback();
      connection.release();
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Fetch partner details from the become_a_partner table
    const [partnerData] = await connection.query(
      `SELECT * FROM become_a_partner WHERE id = ?`, [partnerId]
    );

    if (partnerData.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ message: 'Partner not found' });
    }

    const partner = partnerData[0];

    // Check if a company with the same BR number already exists
    const [existingCompany] = await connection.query(
      `SELECT id FROM company WHERE company_brno = ?`, [partner.company_brno]
    );

    if (existingCompany.length > 0) {
      await connection.rollback();
      connection.release();
      return res.status(409).json({ message: 'A company with this BR number already exists.' });
    }

    // Insert company data
    const [insertResult] = await connection.query(
      `INSERT INTO company (company_name, company_address, company_city, company_website, company_telephone, company_email, company_whatsapp, company_brno, company_vatno, company_br, company_vat, date, companycountry_id, status_id,comany_category_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
      [partner.company_name, partner.company_address, partner.company_city, partner.company_website, partner.company_mobile, partner.company_email, partner.company_wtsapp, partner.company_brno, partner.company_vatno, partner.company_br, partner.company_vat, new Date(), partner.companycountry_id, 1, category]
    );

    const companyId = insertResult.insertId;

    // Check if a director with the given email already exists
    const [existingDirector] = await connection.query(
      `SELECT id FROM partner WHERE email = ?`, [partner.directoremail]
    );

    if (existingDirector.length > 0) {
      await connection.rollback();
      connection.release();
      return res.status(409).json({ message: 'A director with this email already exists.' });
    }

    // Insert director data
    const [directorResult] = await connection.query(
      `INSERT INTO partner (name, email, mobileno, designation, company_id, country_id, status_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [partner.directorname, partner.directoremail, partner.directormobile, 'Director', companyId, partner.companycountry_id, 1]
    );

    const directorPartnerId = directorResult.insertId;

    // Generate and hash a random password
    const plainPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Insert partner user data
    await connection.query(
      `INSERT INTO partner_user (username, password, partner_id, portal_id, role_id) VALUES (?, ?, ?, ?, ?)`,
      [partner.directoremail, hashedPassword, directorPartnerId, 1, 1]
    );

    // Update become a partner status
    await connection.query(
      'UPDATE become_a_partner SET becomestatus_id = ?, approvedby_id = ? WHERE id = ?',
      [2, req.user.id, partnerId]
    );

    await db.promise().query(
      'INSERT INTO stafflogs (timestamp, action, staff_user_id) VALUES (NOW(), ?, ?)',
      [`Registered a new partner: BR No = ${partner.company_brno}`, req.user.id]
    );

    const transporter = await getTransporter();

    const mailOptions = {
      from: 'partnerinfo@connexit.biz',
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
      ` // Your existing HTML content
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully!');
      await connection.commit();
      connection.release();
      res.status(200).json({
        message: 'Company, director, and partner user registered successfully, password sent via email',
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      await connection.rollback();
      connection.release();
      return res.status(500).json({ message: 'Failed to send email', error: error.toString() });
    }

    // Commit transaction after successful email
    await connection.commit();
    connection.release();

    res.status(200).json({
      message: 'Company, director, and partner user registered successfully, password sent via email',
    });
  } catch (err) {
    // If an error occurs, rollback all database changes
    await connection.rollback();
    connection.release();
    console.log(err);

    console.error('Error registering company, director, and partner user:', err);
    return res.status(500).json({ message: 'Error registering company, director, and partner user', error: err });
  }
};


// Error handler middleware function (basic example)
const errorHandler = (err, req, res, next) => {
  res.status(500).json({ message: 'Internal server error', error: err.message });
};

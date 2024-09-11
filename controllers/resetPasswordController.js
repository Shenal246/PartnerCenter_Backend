const db = require('../config/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const requestResetPassword = async (req, res) => {
    const { email } = req.body;
    const token = crypto.randomBytes(20).toString('hex');
    const expireTime = new Date(Date.now() + 3600000); // 1 hour from now

    pool.query('UPDATE staff_user SET reset_password_token=?, reset_password_expires=? WHERE email=?', 
    [token, expireTime, email], (error, results) => {
      if (error) {
        return res.status(500).json({ message: 'Database error', error: error });
      }

      let transporter = nodemailer.createTransport({
        host: "smtp.example.com", // Your SMTP server
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      const resetUrl = `http://yourfrontenddomain/reset/${token}`;
      transporter.sendMail({
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: 'Password Reset Request',
        html: `Please click on the following link to reset your password: <a href="${resetUrl}">${resetUrl}</a>`
      }, (error, info) => {
        if (error) {
          return res.status(500).json({ message: 'Error sending email', error: error });
        }
        res.json({ message: 'Reset password email sent' });
      });
    });
  };

  const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    pool.query('SELECT * FROM staff_user WHERE reset_password_token=? AND reset_password_expires>?', 
    [token, new Date()], (error, results) => {
      if (error) {
        return res.status(500).json({ message: 'Database error', error: error });
      }
      if (results.length === 0) {
        return res.status(400).send('Password reset token is invalid or has expired.');
      }

      const hashedPassword = bcrypt.hashSync(newPassword, 10);
      pool.query('UPDATE staff_user SET password=? WHERE email=?', 
      [hashedPassword, results[0].email], (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Database error', error: error });
        }
        res.send('Password has been successfully reset.');
      });
    });
  };
// my-b2b-app/controllers/companyController.js
const db = require('../config/database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

exports.staffRegister = async (req, res) => {
  const { staffId, portalId , roleId } = req.body;

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

    // Insert data into the company table
    // const [insertResult] = await db.promise().query(`
    //         INSERT INTO staff_user 
    //         (company_name, company_address, company_city, company_website, company_telephone, 
    //         company_email, company_whatsapp, company_brno, company_vatno, company_br, company_vat,
    //         date, companycountry_id, status_id)
    //         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    //     `, [
    //   partner.company_name, partner.company_address, partner.company_city, partner.company_website,
    //   partner.company_mobile, partner.company_email, partner.company_wtsapp, partner.company_brno,
    //   partner.company_vatno, partner.company_br, partner.company_vat, new Date(), partner.companycountry_id, 1
    // ]);

    // const companyId = insertResult.insertId;

    // Check if a director with the given email already exists
    // const [existingDirector] = await db.promise().query(`
    //         SELECT id FROM partner WHERE email = ?
    //     `, [partner.directoremail]);

    // if (existingDirector.length > 0) {
    //   return res.status(210).json({ message: 'A director with this email already exists.' });
    // }

    // Insert director details into the partner table
    // const [directorResult] = await db.promise().query(`
    //         INSERT INTO staff_user 
    //         (name, email, mobileno, designation, company_id, country_id, status_id)
    //         VALUES (?, ?, ?, ?, ?, ?, ?)
    //     `, [
    //   partner.directorname, partner.directoremail, partner.directormobile, 'Director',
    //   companyId, partner.companycountry_id, 1
    // ]);

    // const directorPartnerId = directorResult.insertId;

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

    res.status(201).json({
      message: 'Staff Account Created successfully',
      password: plainPassword // Send the generated password to the frontend
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

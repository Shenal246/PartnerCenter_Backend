const db = require('../config/database');
const { errorHandler } = require('../middlewares/errorHandler');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/becomePartner');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// File upload middleware
exports.uploadFiles = upload.fields([
  { name: 'brFile' },
  { name: 'vatFile' },
  { name: 'form20File' }
]);

// Function to trim and sanitize all string inputs
const trimAndSanitizeData = (data) => {
  const trimmedData = {};
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'string') {
      trimmedData[key] = data[key].trim();
    } else {
      trimmedData[key] = data[key];
    }
  });
  return trimmedData;
};

// Function to handle file paths, return null if no file is uploaded
const getFilePath = (files, fileName) => {
  return files && files[fileName] ? files[fileName][0].path : null;
};

// Function to check if a record exists by BR number
const checkExistingBR = async (brNumber) => {
  const [existingRecord] = await db.promise().query(
    'SELECT id FROM become_a_partner WHERE company_brno = ?',
    [brNumber]
  );
  return existingRecord.length > 0;
};

// Function to check if the dCompany Email already exists in the database
async function checkExistingCompanyEmail(email) {
  const [result] = await db.promise().query(
    'SELECT company_email FROM company WHERE company_email = ?',
    [email]
  );
  return result.length > 0;
}

// Function to check if the director's email already exists in the database
async function checkExistingDirectorEmail(email) {
  const [result] = await db.promise().query(
    'SELECT directoremail FROM become_a_partner WHERE directoremail = ?',
    [email]
  );
  return result.length > 0;
}

exports.becomePartner = async (req, res) => {
  const connection = await db.promise().getConnection(); // Get a database connection
  try {
    const data = trimAndSanitizeData(req.body); // Sanitize input data
    const brFile = getFilePath(req.files, 'brFile');
    const vatFile = getFilePath(req.files, 'vatFile');
    const forn20 = getFilePath(req.files, 'forn20');
    console.log(data);

    // Begin a transaction
    await connection.beginTransaction();

    // Check if a partner with the same company email already exists
    const isExisting = await checkExistingCompanyEmail(data.companyEmail);
    if (isExisting) {
      await connection.rollback(); // Rollback transaction
      return res.status(210).json({ message: 'A partner with this company already exists.' });
    }

    // Check if the director's email is already in use
    const isExistingDirectorEmail = await checkExistingDirectorEmail(data.directorEmail);
    if (isExistingDirectorEmail) {
      await connection.rollback(); // Rollback transaction
      return res.status(409).json({ message: 'A partner with this director email already exists.' });
    }

    // Insert the main `become_a_partner` data
    const [result] = await connection.query(
      `INSERT INTO become_a_partner 
        (fillname, fillemail, filldesignation, fillmobile, filldepartment, company_name, 
        company_address, company_city, company_website, company_email, company_mobile, 
        companycountry_id, company_wtsapp, company_brno, company_vatno, company_br, company_vat, 
        directorname, directoremail, directormobile, directorwtsapp, form20submit, date, country_id, becomestatus_id,referred_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,

      [
        data.personalName, data.personalEmail, data.designation, data.personalMobile, data.department,
        data.companyName, data.address, data.city, data.websiteLink, data.companyEmail,
        data.telephone, data.country, data.whatsappBusiness, data.brNumber, data.vatNumber,
        brFile, vatFile, data.directorName, data.directorEmail, data.directorMobile,
        data.directorWhatsapp, forn20, new Date(), 1, 1, data.referredBy
      ]
    );

    // Get the newly created partner ID
    const becomePartnerId = result.insertId;

    // Parse expertise and industries arrays from string format to actual arrays
    const expertiseArray = JSON.parse(data.expertise); // Converts '[1,2,3,4]' to [1,2,3,4]
    const industriesArray = JSON.parse(data.industries); // Converts '[1,2,3,6]' to [1,2,3,6]

    // Insert expertise records into `become_a_partner_has_expertise` table
    for (const expertiseId of expertiseArray) {
      await connection.query(
        `INSERT INTO become_a_partner_has_expertise (become_a_partner_id, expertise_id) VALUES (?, ?)`,
        [becomePartnerId, expertiseId]
      );
    }

    // Insert industries records into `become_a_partner_has_industries` table
    for (const industriesId of industriesArray) {
      await connection.query(
        `INSERT INTO become_a_partner_has_industries (become_a_partner_id, industries_id) VALUES (?, ?)`,
        [becomePartnerId, industriesId]
      );
    }

    // Commit the transaction if all operations are successful
    await connection.commit();

    res.status(201).json({ message: 'Partner application submitted successfully' });
  } catch (err) {
    // Rollback transaction in case of any error
    await connection.rollback();
    console.error('Error submitting partner application:', err);
    res.status(500).json({ message: 'An error occurred while submitting the application. Please try again later.' });
  } finally {
    // Release the connection back to the pool
    connection.release();
  }
};



exports.getPartnerApplications = async (req, res) => {
  try {
    const query = `
      SELECT 
        bp.id,
        bp.fillname AS personalName,
        bp.fillemail AS personalEmail,
        bp.filldesignation AS designation,
        bp.fillmobile AS personalMobile,
        bp.filldepartment AS department,
        bp.company_name AS companyName,
        bp.company_address AS companyAddress,
        bp.company_city AS companyCity,
        bp.company_website AS companyWebsite,
        bp.company_email AS companyEmail,
        bp.company_mobile AS companyMobile,
        bp.company_wtsapp AS whatsappBusiness,
        bp.company_brno AS brNumber,
        bp.company_vatno AS vatNumber,
        bp.company_br AS brFile,
        bp.company_vat AS vatFile,
        bp.directorname AS directorName,
        bp.directoremail AS directorEmail,
        bp.directormobile AS directorMobile,
        bp.directorwtsapp AS directorWhatsapp,
        bp.form20submit AS form20File,
        bp.date,
        bp.referred_by AS referred_by,
        c.id AS countryId,
        c.name AS countryName,
        bs.id AS becomeStatusId,
        bs.name AS becomeStatusName
      FROM 
        become_a_partner bp
      JOIN 
        country c ON bp.companycountry_id = c.id
      JOIN 
        becomestatus bs ON bp.becomestatus_id = bs.id
      ORDER BY 
        bp.date DESC
    `;

    const [rows] = await db.promise().query(query);

    // Send response as JSON
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching partner applications:', err);
    res.status(500).json({ message: 'An error occurred while retrieving the partner applications. Please try again later.' });
  }
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { becomestatus_id } = req.body;

  if (!becomestatus_id) {
    return res.status(400).json({ message: 'Partner Data Ful filled YOu cant update' });
  }

  try {
    const [result] = await db.promise().query(
      'UPDATE become_a_partner SET becomestatus_id = ? WHERE id = ?',
      [becomestatus_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    res.status(200).json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating partner status:', error);
    errorHandler(error, req, res);
  }
};

exports.rejectpartnerfunction = async (req, res) => {

  const { id, password, note } = req.body;

  if (!id || !password || !note) {
    return res.status(400).json({ message: 'Partner ID, Password, Note are required' });
  }

  const becomepartnerID = id;

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
  `, [becomepartnerID]);

    if (partnerData.length === 0) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    const partner = partnerData[0];

    // Change the become a partner status
    await db.promise().query(
      'UPDATE become_a_partner SET becomestatus_id = ?, approvedby_id = ?, note = ? WHERE id = ?',
      [3, req.user.id, note, becomepartnerID]
    );

    await db.promise().query(
      'INSERT INTO stafflogs (timestamp, action, staff_user_id) VALUES (NOW(), ?, ?)',
      [`Rejected a new partner: BR No = ${partner.company_brno}`, req.user.id]
    );

    res.status(200).json({
      message: 'Partner Registration Rejected'
    });


  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
    console.log(err);

  }


};

//expertise
exports.getExpertise = async (req, res) => {

  try {
    const [rows] = await db.promise().query(`SELECT * FROM expertise`);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching :", err);
    res.status(500).json({ error: err.message });
  }


}


//industries

exports.getIndustries = async (req, res) => {

  try {
    const [rows] = await db.promise().query(`SELECT * FROM industries`);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching :", err);
    res.status(500).json({ error: err.message });
  }


}

exports.updatePartnerdata = async (req, res) => {
  const data = trimAndSanitizeData(req.body); // Sanitize input data
  const brFile = getFilePath(req.files, 'brFile');
  const vatFile = getFilePath(req.files, 'vatFile');
  const form20File = getFilePath(req.files, 'form20File');

  console.log(data); // Logging the sanitized data and file paths
  try {
    // Build an update query dynamically based on what data is present
    const fieldsToUpdate = [];
    const queryValues = [];
    

    if (data.vatNumber) {
      fieldsToUpdate.push('company_vatno = ?');
      queryValues.push(data.vatNumber);
    }if(data.vatNumber== ''){
      fieldsToUpdate.push('company_vatno = ?');
      queryValues.push(null);
    }

    if (data.brNumber) {
      fieldsToUpdate.push('company_brno = ?');
      queryValues.push(data.brNumber);
    }if(data.brNumber== ''){
      fieldsToUpdate.push('company_brno = ?');
      queryValues.push(null);
    }

    if (brFile) {
      fieldsToUpdate.push('company_br = ?');
      queryValues.push(brFile);
    }
    if (vatFile) {
      fieldsToUpdate.push('company_vat = ?');
      queryValues.push(vatFile);
    }
    if (form20File) {
      fieldsToUpdate.push('form20submit = ?');
      queryValues.push(form20File);
    }

    if (fieldsToUpdate.length > 0) {
      const queryString = `UPDATE become_a_partner SET ${fieldsToUpdate.join(', ')} WHERE id=?`;
      queryValues.push(data.id); // Always append id last

      const [result] = await db.promise().query(queryString, queryValues);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Partner not found' });
      }

      res.status(200).json({ message: 'Status updated successfully' });
    } else {
      res.status(400).json({ message: 'No updates were provided' });
    }
  } catch (error) {
    console.error('Error updating partner status:', error);
    if (typeof errorHandler === 'function') {
      errorHandler(error, req, res);
    } else {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }
};

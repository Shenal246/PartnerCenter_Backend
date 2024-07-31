// controllers/partnerController.js
const pool = require('../config/database');
const { errorHandler } = require('../middlewares/errorHandler');

exports.becomePartner = async (req, res, next) => {
  try {
    const {
      fillname, fillemail, filldesignation, fillmobile, filldepartment,
      company_name, company_address, company_city, company_website, company_email,
      company_mobile, company_wtsapp, companycountry_id, company_brno,
      company_vatno, company_br, company_vat, directorname, directoremail,
      directormobile, directorwtsapp, form20submit, date, country_id, becomestatus_id
    } = req.body;

    await pool.query(`
      INSERT INTO become_a_partner 
      (fillname, fillemail, filldesignation, fillmobile, filldepartment, company_name, 
      company_address, company_city, company_website, company_email, company_mobile, 
      company_wtsapp, companycountry_id, company_brno, company_vatno, company_br, 
      company_vat, directorname, directoremail, directormobile, directorwtsapp, 
      form20submit, date, country_id, becomestatus_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      fillname, fillemail, filldesignation, fillmobile, filldepartment, company_name,
      company_address, company_city, company_website, company_email, company_mobile,
      company_wtsapp, companycountry_id, company_brno, company_vatno, company_br, company_vat,
      directorname, directoremail, directormobile, directorwtsapp, form20submit, date, country_id, becomestatus_id
    ]);

    res.status(201).json({ message: 'Partner application submitted successfully' });
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { becomestatus_id } = req.body;

  if (!becomestatus_id) {
    return res.status(400).json({ message: 'becomestatus_id is required' });
  }

  try {
    const [result] = await db.query(
      'UPDATE become_a_partner SET becomestatus_id = ? WHERE id = ?',
      [becomestatus_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    res.status(200).json({ message: 'Status updated successfully' });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

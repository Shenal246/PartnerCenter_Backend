// controllers/partnerController.js
const pool = require('../config/database');

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
      (fillname, fillemail, filldesignation, fillmobile, filldepartment, company_name, company_address, company_city, company_website, company_email, company_mobile, company_wtsapp, companycountry_id, company_brno, company_vatno, company_br, company_vat, directorname, directoremail, directormobile, directorwtsapp, form20submit, date, country_id, becomestatus_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      fillname, fillemail, filldesignation, fillmobile, filldepartment, company_name, company_address, company_city, company_website, company_email, company_mobile, company_wtsapp, companycountry_id, company_brno, company_vatno, company_br, company_vat, directorname, directoremail, directormobile, directorwtsapp, form20submit, date, country_id, becomestatus_id
    ]);

    res.status(201).json({ message: 'Partner application submitted successfully' });
  } catch (err) {
    next(err);
  }
};

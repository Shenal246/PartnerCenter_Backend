const db = require('../config/database');

// Controller function to handle staff registration
exports.registerStaffxx = async (req, res) => {
    try {
        if (!req.body || !req.file) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const { emp_id, name, email, mobileno, designation, country_id, department_id, gender_id } = req.body;
        const imagePath = `/uploads/staff/${req.file ? req.file.filename : null}`;

        // First, check if there is an existing staff with the same email or mobile number
        const [existing] = await db.promise().query(
            'SELECT * FROM staff WHERE email = ? OR mobileno = ?',
            [email, mobileno]
        );

        if (existing.length > 0) {
            return res.status(409).json({ message: 'A staff member with the same email or mobile number already exists.' });
        }

        // If no existing staff member, proceed to insert the new staff
        const staffData = {
            emp_id,
            name: name,  // corrected key to 'name' to match database field
            email,
            mobileno,
            designation,
            country_id,
            department_id,
            gender_id,
            photo: imagePath,
        };

        const [result] = await db.promise().query(
            'INSERT INTO staff (emp_id, name, photo, email, mobileno, designation, status_id, country_id, department_id, gender_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [staffData.emp_id, staffData.name, staffData.photo, staffData.email, staffData.mobileno, staffData.designation, 1, staffData.country_id, staffData.department_id, staffData.gender_id]
        );

        res.status(200).json({ message: 'Staff registered successfully!', staffData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering staff' });
    }
};

exports.getAllStaffDetails = async (req, res) => {
    try {
        // Query to select all staff members
        const [staff] = await db.promise().query(
            `SELECT st.id,st.emp_id, st.name, st.email, st.mobileno, st.designation, st.photo, s.name AS statusname, c.name AS country, g.name AS gender
                FROM staff st
                JOIN status s ON st.status_id = s.id
                JOIN country c ON st.country_id = c.id
                JOIN gender g ON st.gender_id  = g.id
            `
        );

        if (staff.length === 0) {
            return res.status(404).json({ message: 'No staff members found.' });
        }

        // Responding with all staff members' details
        res.status(200).json(staff);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving all staff details' });
    }
};

exports.getAllStafflogs = async (req, res) => {
    try {
        // Query to select all staff members
        const [stafflogs] = await db.promise().query(
            `SELECT sl.timestamp, sl.action, s.name AS staffName, s.emp_id AS employeeID FROM 
                stafflogs sl
                JOIN staff_user su ON sl.staff_user_id = su.id
                JOIN staff s ON su.staff_id = s.id
            `
        );

        if (stafflogs.length === 0) {
            return res.status(404).json({ message: 'No staff logs found.' });
        }

        // Responding with all staff members' details
        res.status(200).json(stafflogs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving all staff details' });
    }
};

exports.getAllPartnerlogs = async (req, res) => {
    try {
        // Query to select all staff members
        const [partnerlogs] = await db.promise().query(
            `SELECT sl.timestamp, sl.action, s.name AS partnerName FROM 
                partnerlogs sl
                JOIN partner_user su ON sl.partner_user_id = su.id
                JOIN partner s ON su.partner_id = s.id
            `
        );

        if (partnerlogs.length === 0) {
            return res.status(404).json({ message: 'No staff logs found.' });
        }

        // Responding with all staff members' details
        res.status(200).json(partnerlogs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving all staff details' });
    }
};



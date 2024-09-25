const db = require('../config/database');

// Controller function to handle staff registration
exports.registerStaffxx = async (req, res) => {
    try {

        if (!req.body || !req.file) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        const imagePath = `/uploads/staff/${req.file ? req.file.filename : null}`;

        // Extract the staff data from the request body
        const staffData = {
            emp_id: req.body.emp_id,
            namee: req.body.name,
            email: req.body.email,
            mobileno: req.body.mobileno,
            designation: req.body.designation,
            country_id: req.body.country_id,
            department_id: req.body.department_id,
            gender_id: req.body.gender_id,
            photo: imagePath, // Handle photo upload
        };

        // Insert the new vendor into the database
        const [result] = await db.promise().query(
            'INSERT INTO staff (emp_id, name, photo,email, mobileno, designation, status_id, country_id, department_id,gender_id) VALUES (?, ?, ?, ?,?,?,?,?,?,?)',
            [staffData.emp_id, staffData.namee, staffData.photo, staffData.email, staffData.mobileno, staffData.designation, 1, staffData.country_id, staffData.department_id, staffData.gender_id]  // Assuming country_id is 1 as a default value
        );

        // Respond to client
        res.status(200).json({ message: 'Staff registered successfully!', staffData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering staff' });
    }
};

const db = require('../config/database');

exports.getCurrencyUnits = async (req, res) => {
    try {
        const [rows] = await db.promise().query('SELECT * FROM currencyunit');
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTypeOptions = async (req, res) => {
    try {
        const [rows] = await db.promise().query('SELECT * FROM type');
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addDealRegistration = async (req, res) => {
    const {
        projectName,
        companyName,
        contactNumber,
        designation,
        email,
        vendor,
        selectProducts,
        closeTimeline,
        budgetValue,
        budgetCurrency,
        competitor,
        type,
        specialRequest,
    } = req.body;

    const date = new Date(); // Set the current date and time for the 'date' field

    try {
        // Query to get the partner_id based on partner_user_id (which is req.user.id)
        const [partnerResult] = await db.promise().query('SELECT partner_id FROM partner_user WHERE id = ?', [req.user.id]);

        if (partnerResult.length === 0) {
            return res.status(404).json({ message: 'Partner not found for the user.' });
        }

        const partner_id = partnerResult[0].partner_id;

        const query = `
        INSERT INTO dealregistration (
          projectname,
          companyname,
          contactno,
          designation,
          email,
          closetimeline,
          budget,
          specialrequest,
          date,
          product_id,
          currencyunit_id,
          type_id,
          partner_id,
          country_id,
          dealstatus_id,
          vendor_id,
          compititor
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

        const [result] = await db.promise().query(query, [
            projectName,
            companyName,
            contactNumber,
            designation,
            email,
            closeTimeline,
            budgetValue,
            specialRequest,
            date,
            selectProducts,
            budgetCurrency,
            type,
            partner_id, // Set the partner_id retrieved from the previous query
            1, // Assuming 1 is the default country_id
            1, // Assuming 1 is the default dealstatus_id
            vendor,
            competitor
        ]);

        await db.promise().query(
            'INSERT INTO partnerlogs (timestamp, action, partner_user_id) VALUES (NOW(), ?, ?)',
            ['Added a DealREgistration', req.user.id]
        );

        res.status(201).json({ message: 'Deal registered successfully', dealId: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log(err);
    }
};

// Get Deal Registration details
exports.getDealRegistrations = async (req, res) => {
    try {
        // Query to get the partner_id based on partner_user_id (which is req.user.id)
        const [partnerResult] = await db.promise().query('SELECT partner_id FROM partner_user WHERE id = ?', [req.user.id]);

        if (partnerResult.length === 0) {
            return res.status(404).json({ message: 'Partner not found for the user.' });
        }

        const partner_id = partnerResult[0].partner_id;

        // SQL query to fetch deal registration details, joining necessary tables for additional details
        const query = `
        SELECT 
            dr.id,
            dr.projectname AS projectName,
            dr.companyname AS companyName,
            dr.contactno AS contactNumber,
            dr.designation,
            dr.email,
            dr.closetimeline AS closeTimeline,
            dr.budget AS amount,
            dr.date,
            dr.specialrequest AS specialRequest, 
            p.name AS productName, 
            v.name AS vendorName, 
            c.name AS currencyUnit, 
            t.name AS typeName, 
            ds.name AS dealStatus, 
            COALESCE(st.name, '') AS approvedBy, -- Fetch the employee's name from the staff table
            COALESCE(wls.name, '') AS winLostStatus -- Fetch winLostStatus only if it's not NULL, otherwise return an empty string
            FROM 
            partnercenter_connex.dealregistration dr
            JOIN 
            partnercenter_connex.product p ON dr.product_id = p.id
            JOIN 
            partnercenter_connex.vendor v ON dr.vendor_id = v.id
            JOIN 
            partnercenter_connex.currencyunit c ON dr.currencyunit_id = c.id
            JOIN 
            partnercenter_connex.type t ON dr.type_id = t.id
            JOIN 
            partnercenter_connex.dealstatus ds ON dr.dealstatus_id = ds.id
            LEFT JOIN 
            partnercenter_connex.staff st ON dr.approvedby_id = st.id -- Join with the staff table to get the employee's name
            LEFT JOIN 
            partnercenter_connex.winloststatus wls ON dr.winloststatus_id = wls.id -- Left join to fetch winLostStatus, keeping it empty if no value exists
            WHERE partner_id = ?
            ORDER BY 
            dr.date DESC;

      `;

        // Execute the SQL query
        const [rows] = await db.promise().query(query, [partner_id]);
        console.log(rows);


        // Return the results as JSON
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.error(err);
    }
};


// Endpoint to get Approved/Pending percentage
exports.getDealRegistrationApproveCount = async (req, res) => {
    try {

        // Query to get the partner_id based on partner_user_id (which is req.user.id)
        const [partnerResult] = await db.promise().query('SELECT partner_id FROM partner_user WHERE id = ?', [req.user.id]);

        if (partnerResult.length === 0) {
            return res.status(404).json({ message: 'Partner not found for the user.' });
        }

        const partner_id = partnerResult[0].partner_id;

        const [rows] = await db.promise().query(`
        SELECT 
          SUM(CASE WHEN dealStatus_id = 2 THEN 1 ELSE 0 END) AS approvedCount,
          SUM(CASE WHEN dealStatus_id = 1 THEN 1 ELSE 0 END) AS pendingCount,
          COUNT(*) AS totalDeals
        FROM dealregistration WHERE partner_id =?
      `, [partner_id]);

        const approvedCount = rows[0].approvedCount || 0;
        const pendingCount = rows[0].pendingCount || 0;
        const totalDeals = rows[0].totalDeals || 1; // Prevent division by zero

        const pendingPercentage = ((approvedCount) / totalDeals) * 100;

        res.json({
            pendingPercentage: Math.round(pendingPercentage),
        });
    } catch (error) {
        console.error('Error fetching deal status counts:', error);
        res.status(500).send('Server error');
    }
};

// Endpoint to get Win/Lost percentage
exports.getDealRegistrationWinCount = async (req, res) => {
    try {
        // Query to get the partner_id based on partner_user_id (which is req.user.id)
        const [partnerResult] = await db.promise().query('SELECT partner_id FROM partner_user WHERE id = ?', [req.user.id]);

        if (partnerResult.length === 0) {
            return res.status(404).json({ message: 'Partner not found for the user.' });
        }

        const partner_id = partnerResult[0].partner_id;

        const [rows] = await db.promise().query(`
        SELECT 
          SUM(CASE WHEN winLostStatus_id = 1 THEN 1 ELSE 0 END) AS winCount,
          SUM(CASE WHEN winLostStatus_id = 2 THEN 1 ELSE 0 END) AS lostCount,
          COUNT(*) AS totalDeals
        FROM dealregistration WHERE partner_id=?
      `, [partner_id]);

        const winCount = rows[0].winCount || 0;
        const lostCount = rows[0].lostCount || 0;
        const totalDeals = rows[0].totalDeals || 1; // Prevent division by zero

        const winLostPercentage = (winCount / totalDeals) * 100;

        res.json({
            winLostPercentage: Math.round(winLostPercentage),
        });
    } catch (error) {
        console.error('Error fetching deal outcome counts:', error);
        res.status(500).send('Server error');
    }
};

// Endpoint to get total completed deals count
exports.getDealRegistrationCompletedCount = async (req, res) => {
    try {

        // Query to get the partner_id based on partner_user_id (which is req.user.id)
        const [partnerResult] = await db.promise().query('SELECT partner_id FROM partner_user WHERE id = ?', [req.user.id]);

        if (partnerResult.length === 0) {
            return res.status(404).json({ message: 'Partner not found for the user.' });
        }

        const partner_id = partnerResult[0].partner_id;

        const [rows] = await db.promise().query(`
        SELECT COUNT(*) AS completedDealsCount
        FROM dealregistration
        WHERE dealStatus_id = 2 AND partner_id=?
      `, partner_id);

        const completedDealsCount = rows[0].completedDealsCount || 0;

        res.json({ completedDealsCount });
    } catch (error) {
        console.error('Error fetching completed deals count:', error);
        res.status(500).send('Server error');
    }
};

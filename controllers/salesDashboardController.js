const db = require("../config/database");


exports.getdashboardDetails = async (req, res) => {
    try {


        const [staffResult] = await db.promise().query('SELECT staff_id FROM staff_user WHERE id = ?', [req.user.id]);

        if (staffResult.length === 0) {
            return res.status(404).json({ message: 'Staff not found for the user.' });
        }

        const staff_id = staffResult[0].staff_id;

        // Run all queries in parallel using Promise.all
        const [partners, vendors, companies, products, requestStatus, username] = await Promise.all([
            db.promise().query(`SELECT COUNT(id) AS totalPartners FROM partner WHERE status_id = 1`),
            db.promise().query(`SELECT COUNT(id) AS totalVendors FROM vendor WHERE status_id = 1`),
            db.promise().query(`SELECT COUNT(id) AS totalCompanies FROM company WHERE status_id = 1`),
            db.promise().query(`SELECT COUNT(id) AS totalProducts FROM product WHERE status_id = 1`),
            // Query to get the count of partner requests grouped by their status
            db.promise().query(`
                SELECT 
                    becomestatus_id, 
                    COUNT(id) AS count 
                FROM 
                    become_a_partner 
                GROUP BY 
                    becomestatus_id
            `),
            db.promise().query(`SELECT name AS userName FROM staff WHERE id=${staff_id} `),
        ]);





        // Map the requestStatus data into readable labels (Pending, Approved, Rejected)
        const requestStatusMap = requestStatus[0].reduce((acc, row) => {
            switch (row.becomestatus_id) {
                case 1:
                    acc.pending = row.count;
                    break;
                case 2:
                    acc.approved = row.count;
                    break;
                case 3:
                    acc.rejected = row.count;
                    break;
                default:
                    acc.unknown = (acc.unknown || 0) + row.count; // in case there are unknown statuses
            }
            return acc;
        }, {});

        // Prepare the response object with all the counts
        const dashboardDetails = {
            totalPartners: partners[0][0].totalPartners,
            totalVendors: vendors[0][0].totalVendors,
            totalCompanies: companies[0][0].totalCompanies,
            totalProducts: products[0][0].totalProducts,
            partnerRequestStatus: {
                pending: requestStatusMap.pending || 0,
                approved: requestStatusMap.approved || 0,
                rejected: requestStatusMap.rejected || 0,

            },
            userName: username[0][0].userName
        };

        // Return the object with the counts
        res.status(200).json(dashboardDetails);

    } catch (error) {
        // Return 500 if there's an error
        res.status(500).json({ message: error.message });
    }
};
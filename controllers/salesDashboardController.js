const db = require("../config/database");


exports.getdashboardDetails = async (req, res) => {
    try {


        const [staffResult] = await db.promise().query('SELECT staff_id FROM staff_user WHERE id = ?', [req.user.id]);

        if (staffResult.length === 0) {
            return res.status(404).json({ message: 'Staff not found for the user.' });
        }

        const staff_id = staffResult[0].staff_id;


        const [salesdataResult, requestStatus, username, dealrequets] = await Promise.all([
            db.promise().query(`SELECT p.modelno, p.image, COUNT(pr.id) AS request_count FROM productrequests pr JOIN product p ON p.id = pr.product_id JOIN staff s ON p.pm_id = s.id WHERE s.id=${staff_id} GROUP BY p.modelno ORDER BY COUNT(pr.id) DESC`),

            // Query to get the count of partner requests grouped by their status
            db.promise().query(`
                              SELECT 
            pr.prodrequeststatus_id, COUNT(pr.id) AS count
            FROM 
            productrequests pr
            JOIN 
            product p ON p.id = pr.product_id
            JOIN 
            staff s ON p.pm_id = s.id 
            WHERE 
             s.id = ${staff_id}  
            GROUP BY  
            prodrequeststatus_id  `),
            db.promise().query(`SELECT name AS userName FROM staff WHERE id= ${staff_id} `),
            db.promise().query(
                `SELECT 
    dr.companyname,
    dr.budget,
    ds.name AS deal_status_name,
    DATE_FORMAT(dr.date, '%Y-%m-%d') AS date,
     c.name AS currency
FROM 
    dealregistration dr
    JOIN product p ON dr.product_id = p.id
    JOIN staff s ON p.pm_id = s.id
       LEFT JOIN currencyunit c ON dr.currencyunit_id = c.id
    LEFT JOIN dealstatus ds ON dr.dealstatus_id = ds.id
WHERE 
    p.pm_id =  ${staff_id} AND dr.dealstatus_id=1 LIMIT 3`

            ),
        ]);



        const requestStatusMap = requestStatus[0].reduce((acc, row) => {
            switch (row.prodrequeststatus_id) {
                case 1:
                    acc.Pending = row.count;
                    break;
                case 2:
                    acc.Approved = row.count;
                    break;
                case 3:
                    acc.Rejected = row.count;
                    break;
                default:
                    acc.Reconsider = row.count; // in case there are unknown statuses
            }
            return acc;
        }, {});


        const dashboardDetails = {
            salesdata: salesdataResult[0].map(row => ({
                modelno: row.modelno,
                image: row.image,
                request_count: row.request_count
            })),
            partnerRequestStatus: {
                pending: requestStatusMap.Pending || 0,
                approved: requestStatusMap.Approved || 0,
                rejected: requestStatusMap.Rejected || 0,
                reconsider: requestStatusMap.Reconsider || 0
            },
            userName: username[0][0].userName,
            // Process the dealrequets to remove buffer data and keep only necessary fields
            dealrequetsdata: dealrequets[0].map(row => ({
                companyname: row.companyname,
                budget: row.budget,
                deal_status_name: row.deal_status_name,
                date: row.date,
                currency: row.currency
            }))
        };

        // Return the object with the counts
        res.status(200).json(dashboardDetails);

    } catch (error) {
        // Return 500 if there's an error

        console.log(error);

        res.status(500).json({ message: error.message });
    }
};
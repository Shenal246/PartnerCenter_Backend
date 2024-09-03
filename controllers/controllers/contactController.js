const db = require('../../config/database2');

// Add a New Message
exports.addMessage = async (req, res) => {
    const { firstname, lastname, tpno, company, email, comment, status = 'new',cnt } = req.body;
    
    try {
        const [result] = await db.promise().query(
            `INSERT INTO contactus(firstname, lastname, company, tpno, email, comment, countryid, statusid) VALUES (?,?,?,?,?,?,?,?)`,
            [ firstname, lastname, tpno, company, email, comment, status,cnt]
        );

        res.status(200).json({ message: 'Message added successfully', messageId: result.insertId });
    } catch (err) {
        console.error("Error adding message:", err);
        res.status(500).json({ error: err.message });
    }
};

// Get All Messages
exports.getMessages = async (req, res) => {
    const cnt = req.headers.cnt;  // Assuming the country ID is sent via headers

    if (!cnt) {
        return res.status(400).json({ error: 'Country ID is required' });
    }

    try {
        const [rows] = await db.promise().query('SELECT * FROM `contactus` WHERE countryid = ? ORDER BY statusid ASC', [cnt]);

        res.status(200).json(rows);
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ error: err.message });
    }
};


// Update Message Status
exports.updateMessageStatus = async (req, res) => {
    const { id } = req.params;
  

    try {
        const [result] = await db.promise().query(
            `UPDATE contactus 
             SET statusid = "read" 
             WHERE id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Message not found' });
        }

        res.status(200).json({ message: 'Message status updated successfully' });
    } catch (err) {
        console.error("Error updating message status:", err);
        res.status(500).json({ error: err.message });
    }
};

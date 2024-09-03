const db = require('../../config/database2');

// Add a New Event
exports.addEvent = async (req, res) => {
    const { title, description, time, date, mode, cnt, status = 'enabled', seats } = req.body;
    const image = req.file ? req.file.buffer : null;

    try {
        const [result] = await db.promise().query(
            `INSERT INTO upcomingevents (title, description, time, date, mode, cnt, status, image_data, seats) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description, time, date, mode, cnt, status, image, seats]
        );

        res.status(200).json({ message: 'Event added successfully', eventId: result.insertId });
    } catch (err) {
        console.error("Error adding event:", err);
        res.status(500).json({ error: err.message });
    }
};

// Get All Events by Country ID (cnt)
exports.getEvents = async (req, res) => {
    const cnt = req.headers.cnt;

    try {
        const [rows] = await db.promise().query('SELECT * FROM upcomingevents WHERE cnt = ? ORDER BY id ASC', [cnt]);

        const events = rows.map(row => ({
            ...row,
            image_data: row.image_data ? row.image_data.toString('base64') : null // Convert the image data to base64
        }));

        res.status(200).json(events);
    } catch (err) {
        console.error("Error fetching events:", err);
        res.status(500).json({ error: err.message });
    }
};

// Update an Event
exports.updateEvent = async (req, res) => {
    const { id } = req.params;
    const { title, description, time, date, mode, status, seats } = req.body;
    const image = req.file ? req.file.buffer : null;

    try {
        const [result] = await db.promise().query(
            `UPDATE upcomingevents 
             SET title = ?, description = ?, time = ?, date = ?, mode = ?, status = ?, seats = ?, 
             image_data = COALESCE(?, image_data) 
             WHERE id = ?`,
            [title, description, time, date, mode, status, seats, image, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json({ message: 'Event updated successfully' });
    } catch (err) {
        console.error("Error updating event:", err);
        res.status(500).json({ error: err.message });
    }
};
// Get Event Registration Data by Event ID
exports.getEventRegistrations = async (req, res) => {
    const { eventId } = req.params;

    try {
        const [rows] = await db.promise().query(
            'SELECT * FROM upcomingregister WHERE upcomingid = ? ORDER BY id ASC', 
            [eventId]
        );

        res.status(200).json(rows);
    } catch (err) {
        console.error("Error fetching event registrations:", err);
        res.status(500).json({ error: err.message });
    }
};

// my-b2b-app/controllers/videoController.js
const db = require('../config/database');

// Controller function to get video information
exports.getVideoInfo = async (req, res) => {
    try {
        // Query to fetch video information
        const [videos] = await db.promise().query(`
            SELECT id, title, link, status_id, country_id
            FROM video
        `);

        // Check if videos are found
        if (videos.length === 0) {
            return res.status(404).json({ message: 'No videos found' });
        }

        // Send the list of videos as a JSON response
        res.status(200).json(videos);
    } catch (err) {
        console.error('Error fetching video information:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

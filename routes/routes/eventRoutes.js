const express = require('express');
const multer = require('multer');
const EventController = require('../../controllers/controllers/eventController');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = express.Router();

// Configure multer for file upload handling
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes
router.post('/events', authMiddleware.verifyTokenforFunctions, upload.single('image'), EventController.addEvent);
router.get('/events', authMiddleware.verifyTokenforFunctions, EventController.getEvents);
router.put('/events/:id', authMiddleware.verifyTokenforFunctions, upload.single('image'), EventController.updateEvent);
router.get('/events/:eventId/registrations', authMiddleware.verifyTokenforFunctions, EventController.getEventRegistrations);

module.exports = router;

const express = require('express');
const MessageController = require('../../controllers/controllers/contactController');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = express.Router();

// Routes
router.post('/messages', authMiddleware.verifyTokenforFunctions, MessageController.addMessage);
router.get('/messages', authMiddleware.verifyTokenforFunctions, MessageController.getMessages);
router.put('/messages/:id/status', authMiddleware.verifyTokenforFunctions, MessageController.updateMessageStatus);

module.exports = router;

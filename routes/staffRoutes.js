// routes/partnerRoutes.js
const express = require('express');
const staffRegisterController = require('../controllers/staffRegisterController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/connexStaffRegister', staffRegisterController.staffRegister);

// Update become_a_partner's becomestatus_id
// router.put('/becomepartner-update-status/:id', verifyToken, partnerController.updateStatus);

module.exports = router;


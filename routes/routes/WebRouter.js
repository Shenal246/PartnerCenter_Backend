const express = require('express');
const multer = require('multer');
const WebController = require('../../controllers/controllers/WebController');
const authMiddleware = require('../../middlewares/authMiddleware');
const router = express.Router();
//smaple


//search
router.get('/vendorlogo', WebController.getActiveVendorslogo);
router.get('/allnews', WebController.getActiveNews);
router.get('/allnewsbytype', WebController.getActiveNewsByType);
router.get('/blogs', WebController.getActiveBlogs);
router.get('/upcomings', WebController.getActiveUpcomingEvent);
router.get('/upcomingsseat', WebController.getActiveUpcomingEventSeat);

//vendorserach
router.get('/vendorpillor1', WebController.getActiveVendorspillor1);
router.get('/vendorpillor2', WebController.getActiveVendorspillor2);
router.get('/vendorpillor3', WebController.getActiveVendorspillor3);
router.get('/vendorpillor4', WebController.getActiveVendorspillor4);
router.get('/vendorpillor5', WebController.getActiveVendorspillor5);
router.get('/vendorpillor6', WebController.getActiveVendorspillor6);
router.get('/vendorpillor7', WebController.getActiveVendorspillor7);
router.get('/vendorpillor8', WebController.getActiveVendorspillor8);


//insert
router.post('/eventregister',WebController.addUpcommingEventRegister);
router.post('/NewChat',WebController.addNewChat);
router.post('/NewContactUs',WebController.addNewContactUs);

//updates
router.put('/upcomingsseat/:id', WebController.updateUpconingSeat);

module.exports = router;

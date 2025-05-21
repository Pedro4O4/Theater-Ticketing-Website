const express = require("express");
const BookingController = require("../Controllers/BookingController");
const authorizationMiddleware=require('../middleware/authorizationMiddleware')
 const authenticationMiddleware = require("../Middleware/authenticationMiddleware");
const router = express.Router();

// Middleware to check if the user is authenticated
router.use(authenticationMiddleware);
// Route to create a new booking
router.post("/",authorizationMiddleware('Standard User'), BookingController.createBooking);
router.get("/:id",authorizationMiddleware('Standard User'), BookingController.getBooking);
router.delete("/:id",authorizationMiddleware('Standard User'), BookingController.deleteBooking);
// Route to get all bookings
module.exports = router;
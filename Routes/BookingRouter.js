const express = require("express");
const BookingController = require("../Controllers/BookingController");
const authorizationMiddleware=require('../middleware/authorizationMiddleware')
const router = express.Router();

// Middleware to check if the user is authenticated
router.use(authorizationMiddleware);
// Route to create a new booking
router.post("/", BookingController.createBooking);
router.get("/:id", BookingController.getBooking);
router.delete("/:id", BookingController.deleteBooking);
// Route to get all bookings
module.exports = router;
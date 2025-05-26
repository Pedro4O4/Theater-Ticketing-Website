const express = require("express");
const BookingController = require("../Controllers/BookingController");
const authorizationMiddleware = require('../Middleware/authorizationMiddleware');
const authenticationMiddleware = require("../Middleware/authenticationMiddleware");
const router = express.Router();

// Route to create a new booking
router.post("/", authorizationMiddleware('Standard User'), BookingController.createBooking);
router.get("/:id", authorizationMiddleware('Standard User'), BookingController.getBooking);
router.delete("/:id", authorizationMiddleware('Standard User'), BookingController.deleteBooking);

module.exports = router;
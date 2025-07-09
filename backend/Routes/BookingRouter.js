const express = require("express");
const BookingController = require("../Controllers/BookingController");
const authorizationMiddleware = require('../middleware/authorizationMiddleware');
const authenticationMiddleware = require("../Middleware/authenticationMiddleware");
const router = express.Router();

// Authentication middleware
router.use(authenticationMiddleware);

// ----- BOOKING ROUTES -----

// Create booking - allow both users and admins to create bookings
router.post("/", authenticationMiddleware, BookingController.createBooking);

// Get user's bookings
router.get("/user", authenticationMiddleware, BookingController.getUserBookings);

// Get booking statistics for organizers
router.get("/stats", authenticationMiddleware, BookingController.getBookingStats);

// Get all bookings for a specific event (for organizers)
router.get("/event/:eventId", authenticationMiddleware, BookingController.getEventBookings);

// Get a specific booking by ID
router.get("/:id", authenticationMiddleware, BookingController.getBooking);

// Cancel a booking - support both PATCH and POST methods
router.patch("/:id/cancel", authenticationMiddleware, BookingController.cancelBooking);
router.post("/:id/cancel", authenticationMiddleware, BookingController.cancelBooking);

// Delete a booking
router.delete("/:id", authenticationMiddleware, BookingController.deleteBooking);

module.exports = router;
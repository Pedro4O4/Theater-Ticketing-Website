const express = require("express");
const { authenticateToken, authorizeRoles } = require("./authMiddleware");

const router = express.Router();

// Admin-only route
router.get("/admin", authenticateToken, authorizeRoles("System Admin"), (req, res) => {
    res.send("Welcome Admin");
});

// Organizer-only route
router.get("/organizer", authenticateToken, authorizeRoles("Organizer"), (req, res) => {
    res.send("Welcome Organizer");
});

//  User route
router.get("/user", authenticateToken, authorizeRoles(" User"), (req, res) => {
    res.send("Welcome User");
});

const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const { authenticate, authorizeRole } = require('../middleware/authMiddleware');

router.get('/profile', authenticate, userController.getUserProfile);
router.put('/profile', authenticate, userController.updateUserProfile);

router.delete('/:id', authenticate, authorizeRole('System Admin'), userController.deleteUser);
router.get('/bookings', authenticate, authorizeRole('Standard User'), userController.getUserBookings);
router.get('/events', authenticate, authorizeRole('Organizer'), userController.getOrganizerEvents);
router.get('/events/analytics', authenticate, authorizeRole('Organizer'), userController.getEventAnalytics);

module.exports = router;

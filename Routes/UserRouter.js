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

module.exports = router;
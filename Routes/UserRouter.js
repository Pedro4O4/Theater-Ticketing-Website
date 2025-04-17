const express = require('express');
const UserController = require('../Controllers/UserController');
const authenticationMiddleware = require('../Middleware/authenticationMiddleware');
const authorizationMiddleware = require('../Middleware/authorizationMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticationMiddleware);

// Admin-only routes
router.get('/', authorizationMiddleware('admin'), UserController.getAllUsers);
router.get('/:id', authorizationMiddleware('admin'), UserController.getUserById);
router.put('/:id', authorizationMiddleware('admin'), UserController.updateUserRole);

module.exports = router;

// Protected routes
router.get('/admin',  authorizationMiddleware('Admin'), (req, res) => {
    res.status(200).json({ message: "Welcome Admin" });
});

router.get('/organizer', authorizationMiddleware('Organizer'), (req, res) => {
    res.status(200).json({ message: "Welcome Organizer" });
});

router.get('/user',  authorizationMiddleware('User'), (req, res) => {
    res.status(200).json({ message: "Welcome User" });
});


        router.get('/profile',  UserController.getUserProfile);
        router.put('/profile',  UserController.updateUserProfile);

        router.delete('/:id', authorizationMiddleware('System Admin'), UserController.DeleteUser);
        router.get('/bookings',  authorizationMiddleware('Standard User'), UserController.GetUserBookings);
        router.get('/events',  authorizationMiddleware('Organizer'), UserController.GetOrganizerEvents);
        router.get('/events/analytics', authorizationMiddleware('Organizer'), UserController.GetOrganizerAnalytics);




module.exports = router;


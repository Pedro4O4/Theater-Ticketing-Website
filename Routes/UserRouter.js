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
=======
const authorize = require('../Middleware/authorizationMiddleware');
const router = express.Router();
const userController = require('../controllers/UserController');
const {authenticate, authorizeRole} = require('../middleware/authenticationMiddleware');


// Protected routes
router.get('/admin', authenticate, authorize('Admin'), (req, res) => {
    res.status(200).json({ message: "Welcome Admin" });
});

router.get('/organizer', authenticate, authorize('Organizer'), (req, res) => {
    res.status(200).json({ message: "Welcome Organizer" });
});

router.get('/user', authenticate, authorize('User'), (req, res) => {
    res.status(200).json({ message: "Welcome User" });
});


        router.get('/profile', authenticate, userController.getUserProfile);
        router.put('/profile', authenticate, userController.updateUserProfile);

        router.delete('/:id', authenticate, authorizeRole('System Admin'), userController.DeleteUser);
        router.get('/bookings', authenticate, authorizeRole('Standard User'), userController.GetUserBookings);
        router.get('/events', authenticate, authorizeRole('Organizer'), userController.GetOrganizerEvents);
        router.get('/events/analytics', authenticate, authorizeRole('Organizer'), userController.GetOrganizerAnalytics);
r
        module.exports = router;





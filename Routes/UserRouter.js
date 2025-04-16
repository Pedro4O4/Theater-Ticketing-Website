
const express = require('express');
const { register, login, authenticate } = require('../Middleware/authenticationMiddleware');
const authorize = require('../Middleware/authorizationMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);

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



        const express = require('express');
        const router = express.Router();
        const userController = require('../controllers/UserController');
        const {authenticate, authorizeRole} = require('../middleware/authMiddleware');

        router.get('/profile', authenticate, userController.getUserProfile);
        router.put('/profile', authenticate, userController.updateUserProfile);

        router.delete('/:id', authenticate, authorizeRole('System Admin'), userController.deleteUser);
        router.get('/bookings', authenticate, authorizeRole('Standard User'), userController.getUserBookings);
        router.get('/events', authenticate, authorizeRole('Organizer'), userController.getOrganizerEvents);
        router.get('/events/analytics', authenticate, authorizeRole('Organizer'), userController.getEventAnalytics);
r
        module.exports = router;





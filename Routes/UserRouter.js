
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



router.get('/', authenticate, authorize('Admin'), async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



outer.get('/profile', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// PUT /api/v1/users/profile - Update current user's profile (Authenticated Users)
router.put('/profile', authenticate, async (req, res) => {
    try {
        const { name, email, profilePicture } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, email, profilePicture },
            { new: true, runValidators: true }
        );
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// GET /api/v1/users/:id - Get details of a single user (Admin only)
router.get('/:id', authenticate, authorize('Admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});




// PUT /api/v1/users/:id - Update user's role (Admin only)
router.put('/:id', authenticate, authorize('Admin'), async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }
        );
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
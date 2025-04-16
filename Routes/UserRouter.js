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
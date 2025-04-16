const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const eventController = require('../Controllers/EventController');
const authMiddleware = require('../Middleware/authenticationMiddleware');
const authorizationMiddleware = require('../Middleware/authorizationMiddleware');

const validateEvent = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('category').isIn(['concert', 'theater', 'conference', 'workshop', 'festival', 'sports'])
        .withMessage('Invalid category'),
    body('ticketPrice').isFloat({ min: 0 }).withMessage('Valid ticket price is required'),
    body('totalTickets').isInt({ min: 1 }).withMessage('Total tickets must be at least 1'),
];


router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

router.use(authMiddleware);

router.post('/', 
    authorizationMiddleware(['Organizer', 'System Admin']),
    validateEvent,
    eventController.createEvent
);

router.put('/:id',
    authorizationMiddleware(['Organizer', 'System Admin']),
    validateEvent,
    eventController.updateEvent
);

router.delete('/:id',
    authorizationMiddleware(['Organizer', 'System Admin']),
    eventController.deleteEvent
);

router.get('/organizer/events',
    authorizationMiddleware(['Organizer']),
    eventController.getOrganizerEvents
);

module.exports = router;
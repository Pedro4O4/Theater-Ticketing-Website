
const express = require('express');
const router = express.Router();
const eventController = require('../Controllers/EventController');
const authMiddleware = require('../Middleware/authenticationMiddleware');
const authorizationMiddleware = require('../Middleware/authorizationMiddleware');




router.use(authMiddleware);

router.post('/', authorizationMiddleware(['Organizer']), eventController.createEvent);
router.get("/", eventController.getApprovedEvents);
router.get("/all",authorizationMiddleware(['System Admin']), eventController.getAllEvents);


router.get('/:id', eventController.getEventById);

router.put('/:id',
    authorizationMiddleware(['Organizer', 'System Admin']),
    eventController.updateEvent
);
router.delete('/:id',
    authorizationMiddleware(['Organizer', 'System Admin']),
    eventController.deleteEvent
);



module.exports = router;
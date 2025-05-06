
const express = require('express');
const router = express.Router();
const eventController = require('../Controllers/EventController');
const authentication = require('../Middleware/authenticationMiddleware');
const authorizationMiddleware = require('../Middleware/authorizationMiddleware');


router.use(authentication);

router.post('/', authorizationMiddleware(['Organizer']), eventController.createEvent);
router.get("/all",authorizationMiddleware(['System Admin']), eventController.getAllEvents);

router.get("/", authorizationMiddleware(['Organizer', 'System Admin','Standard User']) ,eventController.getApprovedEvents);


router.get('/:id',authorizationMiddleware(["Organizer" , 'System Admin',"Standard User"]), eventController.getEventById);

router.put('/:id',
    authorizationMiddleware(['Organizer', 'System Admin']),
    eventController.updateEvent
);
router.delete('/:id',
    authorizationMiddleware(['Organizer', 'System Admin']),
    eventController.deleteEvent
);



module.exports = router;
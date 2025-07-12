const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const eventController = require('../Controllers/EventController');
const authentication = require('../Middleware/authenticationMiddleware');
const authorizationMiddleware = require('../Middleware/authorizationMiddleware');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Folder to store uploaded files
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Unique file name
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only images (jpeg, jpg, png) are allowed'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB file size limit
    }
});

router.get("/approved", eventController.getApprovedEventsPublic);

router.use(authentication);

// Routes
router.post('/',
    authorizationMiddleware(['Organizer']),
    upload.single('image'),
    eventController.createEvent
);

router.get("/all",
    authorizationMiddleware(['System Admin']),
    eventController.getAllEvents
);

router.get("/",
    authorizationMiddleware(['Organizer', 'System Admin', 'Standard User']),
    eventController.getApprovedEvents
);

router.get('/:id',
    authorizationMiddleware(["Organizer", 'System Admin', "Standard User"]),
    eventController.getEventById
);

router.put('/:id',
    authorizationMiddleware(['Organizer', 'System Admin']),
    upload.single('image'),
    eventController.updateEvent
);

// Request OTP for event deletion
router.post('/:id/request-deletion-otp',
    authorizationMiddleware(['Organizer', 'System Admin']),
    eventController.requestEventDeletionOTP
);

// Verify OTP and delete event
router.post('/verify-deletion-otp',
    authorizationMiddleware(['Organizer', 'System Admin']),
    eventController.verifyEventDeletionOTP
);

// Delete event (only for non-approved events)
router.delete('/:id',
    authorizationMiddleware(['Organizer', 'System Admin']),
    eventController.deleteEvent
);

module.exports = router;
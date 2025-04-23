const Event = require('../Models/Event');
const { validationResult } = require('express-validator');



exports.createEvent = async (req, res) => {
    try {
        // Check if the user is authenticated and has the "Organizer" role
        if (!req.user || req.user.role !== 'Organizer') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: Only organizers can create events'
            });
        }else {
            console.log("User is authenticated and has the Organizer role");
        }

        // Validate request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Extract event details from the request body
        const {
            title,
            description,
            date,
            location,
            category,
            image,
            ticketPrice,
            totalTickets
        } = req.body;

        const remainingTickets = totalTickets;

        // Create a new event
        const event = new Event({
            title,
            description,
            date,
            location,
            category,
            image,
            ticketPrice,
            totalTickets,
            remainingTickets,
            organizer: req.user.id // Use the authenticated user's ID as the organizer
        });

        // Save the event to the database
        await event.save();

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: event
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating event',
            error: error.message
        });
    }
};

exports.getApprovedEvents = async (req, res) => {
    try {
        // Fetch only approved events for public access
        const events = await Event.find({ status: "approved" });
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch approved events." });
    }
};

exports.getAllEvents = async (req, res) => {
    try {
        // Ensure only admins can access this route
        if (req.user.role !== "System Admin") {
            return res.status(403).json({ message: "Only admins can view all events." });
        }

        const events = await Event.find(); // Fetch all events (approved, pending, declined)
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch all events." });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'name email');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.status(200).json({
            success: true,
            data: event
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving event',
            error: error.message
        });
    }
};



exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'System Admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this event'
            });
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: updatedEvent
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating event',
            error: error.message
        });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'System Admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this event'
            });
        }

        await event.remove();

        res.status(200).json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting event',
            error: error.message
        });
    }
};


const Event = require("../models/Event");

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
=======
// POST /api/v1/events
const createEvent = async (req, res) => {
    try {
        const newEvent = new Event({
            ...req.body,
            organizer: req.user._id, // assuming user is authenticated
        });

        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);
    } catch (err) {
        res.status(500).json({ message: "Failed to create event." });
    }
};

// GET /api/v1/events
const getApprovedEvents = async (req, res) => {
    try {
        const events = await Event.find({ status: "approved" });
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch approved events." });
    }
};

// GET /api/v1/events/all
const getAllEvents = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Only admins can view all events." });
    }

    try {
        const events = await Event.find();
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch all events." });
    }
};

// GET /api/v1/events/:id
const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found." });

        if (
            event.status !== "approved" &&
            req.user?.role !== "admin" &&
            !event.organizer.equals(req.user?._id)
        ) {
            return res.status(403).json({ message: "Access denied." });
        }

        res.status(200).json(event);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch event." });
    }
};

// PUT /api/v1/events/:id
const updateEvent = async (req, res) => {
    const { id } = req.params;

    try {
        const event = await Event.findById(id);
        if (!event) return res.status(404).json({ message: "Event not found." });

        const isOwner = event.organizer.equals(req.user._id);
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "Unauthorized." });
        }

        if (req.body.status && !isAdmin) {
            delete req.body.status;
        }

        Object.assign(event, req.body);
        await event.save();

        res.status(200).json(event);
    } catch (err) {
        res.status(500).json({ message: "Failed to update event." });
    }
};

// DELETE /api/v1/events/:id
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found." });

        const isOwner = event.organizer.equals(req.user._id);
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "Unauthorized." });
        }

        await event.deleteOne();
        res.status(200).json({ message: "Event deleted successfully." });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete event." });
    }
};

// PATCH /api/v1/events/:id/status (Admin only)
const updateEventStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Only admins can update event status." });
    }

    if (!["approved", "pending", "declined"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value." });
    }

    try {
        const event = await Event.findByIdAndUpdate(id, { status }, { new: true });
        if (!event) return res.status(404).json({ message: "Event not found." });

        res.status(200).json(event);
    } catch (err) {
        res.status(500).json({ message: "Failed to update event status." });
    }
};

module.exports = {
    createEvent,
    getApprovedEvents,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    updateEventStatus, // optional but recommended
};

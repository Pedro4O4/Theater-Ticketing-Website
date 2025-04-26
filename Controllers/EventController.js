const Event = require('../Models/Event');



 const eventcontroller = {
     createEvent: async (req, res) => {
         try {
             // Check if the user is authenticated and has the "Organizer" role
             if (!req.user || req.user.role !== 'Organizer') {
                 return res.status(403).json({
                     success: false,
                     message: 'Unauthorized: Only organizers can create events'
                 });
             }

             // Extract event details from the request body
             const {
                 title,
                 description,
                 date,
                 location,
                 category,
                 ticketPrice,
                 totalTickets,
                 status
             } = req.body;

             // Create a new event
             const newEvent = new Event({
                 title,
                 description,
                 date,
                 location,
                 category,
                 ticketPrice,
                 totalTickets,
                 status,
                 remainingTickets: totalTickets,
                    // Default status is "pending"
                 organizer: req.user._id // Assuming the organizer's ID is available in req.user
             });

             // Save the event to the database
             await Event.insertOne(newEvent);

             res.status(201).json({
                 success: true,
                 message: 'Event created successfully',
                 data: newEvent
             });
         } catch (error) {
             console.error("Error creating event:", error);
             res.status(500).json({
                 success: false,
                 message: 'Error creating event',
                 error: error.message
             });
         }
     },
     getApprovedEvents: async (req, res) => {
         try {
             const status = "approved"; // Default to "approved" if no status is provided
             // Fetch only approved events for public access
             const events = await Event.find({ status: status });

             if (events.length === 0) {
                 console.log("No approved events found.");
             }

             res.status(200).json(events);
         } catch (err) {
             console.error("Error fetching approved events:", err);
             res.status(500).json({ message: "Failed to fetch approved events." });
         }
     },
    getAllEvents: async (req, res) => {
        try {
            // Ensure only admins can access this route
            if (req.user.role !== "System Admin") {
                return res.status(403).json({ message: "Only admins can view all events." });
            }


            const events = await Event.find(); // Fetch all events (approved, pending, declined)
            if (events.length === 0) {
                console.log("No events found.");
            }
            res.status(200).json(events);
        } catch (err) {
            res.status(500).json({ message: "Failed to fetch all events." });
        }
    },
    getEventById: async (req, res) => {
        try {
            const event = await Event.findById(req.params.id)


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
    },
    updateEvent: async (req, res) => {
        try {
            const event = await Event.findById(req.params.id);

            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Event not found'
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
    },
    deleteEvent: async (req, res) => {
        try {
            const event = await Event.findById(req.params.id);

            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Event not found'
                });
            }

            await Event.deleteOne(event)

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
    }
 };

module.exports = eventcontroller;

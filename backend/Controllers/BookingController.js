const Bookingmodle = require('../Models/Booking');
const Event = require('../Models/Event');

/**
 * Controller for managing bookings
 */
const BookingController = {
    /**
     * Create a new booking
     */
    createBooking: async (req, res) => {
        try {
            console.log("Received booking request:", req.body);
            const {
                eventId,
                numberOfTickets,
                status,
                subtotal,
                percentageFee,
                fixedFee,
                totalPrice
            } = req.body;

            // Simple validation - remove extra checks that might be causing problems
            if (!eventId || !numberOfTickets) {
                console.log("Missing required fields");
                return res.status(400).json({
                    success: false,
                    message: "Event ID and number of tickets are required"
                });
            }

            // Find the event
            const event = await Event.findById(eventId);

            if (!event) {
                console.log("Event not found:", eventId);
                return res.status(404).json({
                    success: false,
                    message: "Event not found"
                });
            }

            // Check ticket availability - only basic check for now
            if (event.remainingTickets < numberOfTickets) {
                console.log("Not enough tickets:", event.remainingTickets, "requested:", numberOfTickets);
                return res.status(400).json({
                    success: false,
                    message: "Not enough tickets available"
                });
            }

            // Calculate fees and total price
            const ticketSubtotal = event.ticketPrice * numberOfTickets;
            const calculatedPercentageFee = percentageFee || (ticketSubtotal * 0.035); // 3.5% of subtotal
            const calculatedFixedFee = fixedFee || (numberOfTickets * 1.99); // $1.99 per ticket
            const calculatedTotalPrice = totalPrice || (ticketSubtotal + calculatedPercentageFee + calculatedFixedFee);

            console.log("Price calculations:", {
                ticketPrice: event.ticketPrice,
                numberOfTickets,
                subtotal: ticketSubtotal,
                percentageFee: calculatedPercentageFee,
                fixedFee: calculatedFixedFee,
                totalPrice: calculatedTotalPrice
            });

            // Reduce available tickets
            event.remainingTickets -= numberOfTickets;
            await event.save(); // Using save() instead of findByIdAndUpdate for better error handling

            // Create the booking
            const booking = new Bookingmodle({
                StandardId: req.user.userId,
                eventId,
                numberOfTickets,
                subtotal: subtotal || ticketSubtotal,
                percentageFee: calculatedPercentageFee,
                fixedFee: calculatedFixedFee,
                totalPrice: calculatedTotalPrice,
                status: 'confirmed' // Always start with confirmed status
            });

            const savedBooking = await booking.save();
            console.log("Booking created successfully:", savedBooking._id);

            // Prepare response with minimal event details
            const bookingWithEvent = {
                ...savedBooking.toObject(),
                event: {
                    title: event.title,
                    date: event.date,
                    location: event.location,
                    image: event.image
                }
            };

            res.status(201).json({
                success: true,
                message: "Booking created successfully",
                booking: bookingWithEvent
            });
        } catch (error) {
            console.error("Error creating booking:", error);
            res.status(500).json({
                success: false,
                message: "Error creating booking",
                error: error.message
            });
        }
    },

    /**
     * Get a specific booking by ID
     */
    getBooking: async (req, res) => {
        try {
            const booking = await Bookingmodle.findById(req.params.id);

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: "Booking not found"
                });
            }

            // Authorization check - simplified to prevent issues
            if (booking.StandardId.toString() !== req.user.userId && req.user.role !== 'System Admin') {
                return res.status(403).json({
                    success: false,
                    message: "Unauthorized: You can only view your own bookings"
                });
            }

            // Get event details
            const event = await Event.findById(booking.eventId);

            // Create response with embedded event details
            const response = {
                ...booking.toObject(),
                event: event ? {
                    title: event.title,
                    date: event.date,
                    location: event.location,
                    description: event.description,
                    image: event.image,
                    category: event.category,
                    ticketPrice: event.ticketPrice
                } : null
            };

            res.status(200).json({
                success: true,
                booking: response
            });
        } catch (error) {
            console.error("Error fetching booking:", error);
            res.status(500).json({
                success: false,
                message: "Error fetching booking",
                error: error.message
            });
        }
    },

    /**
     * Get all bookings for current user
     */
    getUserBookings: async (req, res) => {
        try {
            console.log("Getting bookings for user:", req.user.userId);

            const bookings = await Bookingmodle.find({ StandardId: req.user.userId })
                .sort({ createdAt: -1 });

            // Format the response to include basic event details
            const formattedBookings = await Promise.all(
                bookings.map(async (booking) => {
                    const event = await Event.findById(booking.eventId);
                    return {
                        ...booking.toObject(),
                        event: event ? {
                            title: event.title,
                            date: event.date,
                            location: event.location,
                            image: event.image,
                            ticketPrice: event.ticketPrice
                        } : null
                    };
                })
            );

            res.status(200).json(formattedBookings);
        } catch (error) {
            console.error("Error fetching user bookings:", error);
            res.status(500).json({
                success: false,
                message: "Error fetching user bookings",
                error: error.message
            });
        }
    },

    /**
     * Get all bookings for an event (organizer only)
     */
    getEventBookings: async (req, res) => {
        try {
            const { eventId } = req.params;

            const bookings = await Bookingmodle.find({ eventId });

            res.status(200).json({
                success: true,
                bookings
            });
        } catch (error) {
            console.error("Error fetching event bookings:", error);
            res.status(500).json({
                success: false,
                message: "Error fetching event bookings",
                error: error.message
            });
        }
    },

    /**
     * Cancel a booking
     */
    cancelBooking: async (req, res) => {
        try {
            const booking = await Bookingmodle.findById(req.params.id);

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: "Booking not found"
                });
            }

            // Check if the user owns this booking
            if (booking.StandardId.toString() !== req.user.userId && req.user.role !== 'System Admin') {
                return res.status(403).json({
                    success: false,
                    message: "Unauthorized: You can only cancel your own bookings"
                });
            }

            // Check if booking is already cancelled
            if (booking.status === 'Cancelled') {
                return res.status(400).json({
                    success: false,
                    message: "Booking is already cancelled"
                });
            }

            // Restore tickets to event
            const event = await Event.findById(booking.eventId);
            if (event) {
                event.remainingTickets += booking.numberOfTickets;
                await event.save();
            }

            // Update booking status to cancelled
            booking.status = 'Cancelled';
            await booking.save();

            res.status(200).json({
                success: true,
                message: "Booking cancelled successfully",
                booking
            });
        } catch (error) {
            console.error("Error cancelling booking:", error);
            res.status(500).json({
                success: false,
                message: "Error cancelling booking",
                error: error.message
            });
        }
    },

    /**
     * Delete booking
     */
    deleteBooking: async (req, res) => {
        try {
            const booking = await Bookingmodle.findById(req.params.id);

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: "Booking not found"
                });
            }

            // Restore tickets if booking wasn't cancelled
            if (booking.status !== 'Cancelled') {
                const event = await Event.findById(booking.eventId);
                if (event) {
                    event.remainingTickets += booking.numberOfTickets;
                    await event.save();
                }
            }

            // Delete the booking
            await Bookingmodle.findByIdAndDelete(req.params.id);

            res.status(200).json({
                success: true,
                message: "Booking deleted successfully"
            });
        } catch (error) {
            console.error("Error deleting booking:", error);
            res.status(500).json({
                success: false,
                message: "Error deleting booking",
                error: error.message
            });
        }
    },

    /**
     * Get booking statistics for revenue analytics
     */
    getBookingStats: async (req, res) => {
        try {
            // Get all events for this organizer
            const organizerEvents = await Event.find({ organizerId: req.user.userId });

            if (!organizerEvents || organizerEvents.length === 0) {
                return res.status(200).json({
                    success: true,
                    totalBookings: 0,
                    revenue: { total: 0, fees: 0, net: 0 },
                    bookingsByStatus: { confirmed: 0, pending: 0, cancelled: 0 },
                    monthlyStats: []
                });
            }

            const eventIds = organizerEvents.map(event => event._id);

            // Get all bookings for these events
            const allBookings = await Bookingmodle.find({ eventId: { $in: eventIds } });
            const activeBookings = allBookings.filter(b => b.status !== 'Cancelled');

            // Calculate booking statistics
            const totalBookings = activeBookings.length;

            // Calculate revenue statistics
            const revenue = activeBookings.reduce((acc, booking) => {
                const subtotal = booking.subtotal || 0;
                const percentageFee = booking.percentageFee || 0;
                const fixedFee = booking.fixedFee || 0;
                const totalFees = percentageFee + fixedFee;

                return {
                    total: acc.total + (booking.totalPrice || 0),
                    fees: acc.fees + totalFees,
                    net: acc.net + (subtotal || 0)
                };
            }, { total: 0, fees: 0, net: 0 });

            // Count bookings by status
            const bookingsByStatus = {
                confirmed: allBookings.filter(b => b.status === 'confirmed').length,
                pending: allBookings.filter(b => b.status === 'pending').length,
                cancelled: allBookings.filter(b => b.status === 'Cancelled').length
            };

            // Get monthly statistics for last 6 months
            const monthlyStats = Array.from({ length: 6 }, (_, i) => {
                const monthDate = new Date();
                monthDate.setMonth(monthDate.getMonth() - i);
                const month = monthDate.toLocaleString('default', { month: 'long' });
                const year = monthDate.getFullYear();

                const monthBookings = activeBookings.filter(booking => {
                    const bookingDate = new Date(booking.createdAt || booking._id.getTimestamp());
                    return bookingDate.getMonth() === monthDate.getMonth() &&
                        bookingDate.getFullYear() === monthDate.getFullYear();
                });

                return {
                    month: `${month} ${year}`,
                    bookings: monthBookings.length,
                    revenue: monthBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)
                };
            }).reverse();

            res.status(200).json({
                success: true,
                totalBookings,
                revenue,
                bookingsByStatus,
                monthlyStats
            });
        } catch (error) {
            console.error("Error fetching booking statistics:", error);
            res.status(500).json({
                success: false,
                message: "Error fetching booking statistics",
                error: error.message
            });
        }
    }
};

module.exports = BookingController;
const Bookingmodle = require('../Models/Booking');
const Event = require('../Models/Event');
const BookingController = {
    createBooking: async (req, res) => {
        try {
            const { eventId, numberOfTickets } = req.body;

            // Find the event
            const event = await Event.findById(eventId);
            if (!event) {
                return res.status(404).json({ message: "Event not found" });
            }

            // Check ticket availability
            if (event.remainingTickets < numberOfTickets) {
                return res.status(400).json({ message: "Not enough tickets available" });
            }

            // Calculate total price
            const totalPrice = numberOfTickets * event.ticketPrice;

            // Reduce available tickets
            event.remainingTickets -= numberOfTickets;
            await event.save();

            // Create the booking
            const booking = new Bookingmodle({
                user: req.user.id,
                event: eventId,
                numberOfTickets,
                totalPrice
            });
            await booking.save();

            res.status(201).json({ message: "Booking created successfully", booking });
        } catch (error) {
            res.status(500).json({ message: "Error creating booking", error });
        }
    },
    getBooking: async (req, res) => {
        try {
            const booking = await Bookingmodle.findById(req.params.id);
            if (!booking) {
                return res.status(404).json({ message: "Booking not found" });
            }
            res.status(200).json(booking);
        } catch (error) {
            res.status(500).json({ message: "Error fetching booking", error });
        }
    },deleteBooking: async (req, res) => {
        try {
            const booking = await Bookingmodle.findByIdAndDelete(req.params.id);
            if (!booking) {
                return res.status(404).json({message: "Booking not found"});
            }
            res.status(200).json({message: "Booking deleted successfully"});
        } catch (error) {
            res.status(500).json({message: "Error deleting booking", error});
        }
    }
}
module.exports = BookingController;
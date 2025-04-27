const Bookingmodle = require('../Models/Booking');
const Event = require('../Models/Event');
const BookingController = {

        createBooking: async (req, res) => {
            try {
                const {userId,eventId, numberOfTickets, totalPrice ,status} = req.body;

                // Find the event
                const event = await Event.findById(eventId);

                if (!event) {
                    return res.status(404).json({message: "Event not found"});
                }


                // Check ticket availability
                if (event.remainingTickets < numberOfTickets) {
                    return res.status(400).json({message: "Not enough tickets available"});
                }


                // Reduce available tickets
                event.remainingTickets -= numberOfTickets;
                await Event.findByIdAndUpdate(eventId, {remainingTickets: event.remainingTickets}, {new: true});
                // Create the booking
                const booking = new Bookingmodle({
                    userId,
                     eventId,
                    numberOfTickets,
                    totalPrice,
                    status
                });
                await Bookingmodle.insertOne(booking);
                res.status(201).json({message: "Booking created successfully", booking});
            } catch (error) {
                console.error("Error creating booking:", error);
                res.status(500).json({message: "Error creating booking", error: error.message});
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
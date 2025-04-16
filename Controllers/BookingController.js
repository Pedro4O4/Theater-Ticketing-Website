const Bookingmodle = require('../Models/Booking');

const BookingController = {
    createBooking: async (req, res) => {
        try {
            const { user, event, numberOfTickets, totalPrice } = req.body;
            const booking = new Bookingmodle({ user, event, numberOfTickets, totalPrice });
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
                return res.status(404).json({ message: "Booking not found" });
            }
            res.status(200).json({ message: "Booking deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting booking", error });
        }
    }
}
module.exports = BookingController;
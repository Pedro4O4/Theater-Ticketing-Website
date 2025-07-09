const mongoose = require("mongoose");
const bookingSchema = new mongoose.Schema({
    StandardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true,
    },
    numberOfTickets: {
        type: Number,
        required: true,
        min: 1,
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    subtotal: {
        type: Number,
        required: true
    },
    percentageFee: {
        type: Number,
        required: true,
        default: 0
    },
    fixedFee: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    bookingDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true }); // Automatically adds 'createdAt' and 'updatedAt' fields

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
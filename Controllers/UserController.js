const express = require('express');
const router = express.Router();
const User = require('../Models/User');


router.delete('/:id', authenticationMiddleware, async (req, res) => {
    try {
        
        if (req.user.role !== 'System Admin') {
            return res.status(403).json({ message: 'Only admins can delete users' });
        }

        const userToDelete = await User.findById(req.params.id);
        if (!userToDelete) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});


// GET /api/v1/users/bookings - Get current user's bookings
router.get('/bookings', authenticationMiddleware, async (req, res) => {
    try {
        // Only standard users can access their bookings
        if (req.user.role !== 'Standard User') {
            return res.status(403).json({ message: 'Only standard users can access bookings' });
        }

        const bookings = await Booking.find({ user: req.user.id })
            .populate('event', 'title date location ticketPrice');

        res.status(200).json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.get('/events', authenticationMiddleware, async (req, res) => {
    try {
        // Only organizers can access their events
        if (req.user.role !== 'Organizer') {
            return res.status(403).json({ message: 'Only organizers can access events' });
        }

        const events = await Event.find({ organizer: req.user.id })
            .select('title date location category ticketPrice remainingTickets');

        res.status(200).json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.get('/events/analytics', authenticationMiddleware, async (req, res) => {
    try {
        // Only organizers can access event analytics
        if (req.user.role !== 'Organizer') {
            return res.status(403).json({ message: 'Only organizers can access analytics' });
        }

        const events = await Event.find({ organizer: req.user.id });
        const bookings = await Booking.find({
            event: { $in: events.map(e => e._id) },
            status: 'confirmed'
        });

        const analytics = {
            totalEvents: events.length,
            totalTicketsSold: bookings.reduce((sum, booking) => sum + booking.numberOfTickets, 0),
            totalRevenue: bookings.reduce((sum, booking) => sum + booking.totalPrice, 0),
            eventsByCategory: events.reduce((acc, event) => {
                acc[event.category] = (acc[event.category] || 0) + 1;
                return acc;
            }, {}),
            upcomingEvents: events.filter(event => event.date > new Date()).length
        };

        res.status(200).json(analytics);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.put('/profile', authenticationMiddleware, async (req, res) => {
    try {
        const { name, email, profilePicture } = req.body;

        // Don't allow password updates here (use separate endpoint)
        if (req.body.password) {
            return res.status(400).json({ message: 'Use the password reset endpoint to change password' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { name, email, profilePicture },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});
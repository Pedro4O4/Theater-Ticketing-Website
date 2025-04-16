
const userModel = require("../Models/User");
const Event = require("../Models/Event");
const Booking = require("../Models/Booking");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secretKey = process.env.SECRET_KEY;
const bcrypt = require("bcrypt");
const UserController = {

    register: async (req, res) => {
        try {
            const {name, email, password} = req.body;

            // Check if user already exists
            const existingUser = await userModel.findOne({email});
            if (existingUser) {
                return res.status(400).json({message: "User already exists"});
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new user
            const newUser = new userModel({
                name,
                email,
                password: hashedPassword,
            });
            await newUser.save();

            res.status(201).json({message: "User registered successfully", user: newUser});
        } catch (error) {
            res.status(500).json({message: "Error registering user", error});
        }
    },
    login: async (req, res) => {
        try {
            const {email, password} = req.body;
            const user = await userModel.findOne({email});
            if (!user) {
                return res.status(404).json({message: "User not found"});
            }

            // Compare passwords
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
            }

            // Generate JWT token
            const token = jwt.sign({id: user._id, email: user.email}, secretKey, {expiresIn: "1h"});
            res.status(200).json({message: "Login successful", token});

        } catch (error) {
            res.status(500).json({message: "Error logging in", error});
        }
    },
    forgetPassword: async (req, res) => {
        try {
            const {email} = req.body;// Find user by email
            const user = userModel
            if (!user) {
                return res.status(404).json({message: "User not found"});
            }

            // Generate a reset token (valid for 15 minutes)
            const resetToken = jwt.sign({id: user.id, email: user.email}, secretKey, {expiresIn: "15m"});

            // In a real-world app, you would send this token via email
            res.status(200).json({message: "Password reset token generated", resetToken});
        } catch (error) {
            res.status(500).json({message: "Error generating reset token", error});
        }
    },
    async getAllUsers(req, res) {
        try {
            const users = await userModel.find().select('-password');
            return res.status(200).json({ success: true, data: users });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    },

    // Get single user by ID - Admin only
    async getUserById(req, res) {
        try {
            const user = await userModel.findById(req.params.id).select('-password');
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            return res.status(200).json({ success: true, data: user });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    },

    // Update user role - Admin only
    async updateUserRole(req, res) {
        try {
            const { role } = req.body;

            if (!role) {
                return res.status(400).json({ message: "Role is required" });
            }

            // Validate role is one of the allowed types
            const allowedRoles = ['standard', 'organizer', 'admin'];
            if (!allowedRoles.includes(role)) {
                return res.status(400).json({ message: "Invalid role" });
            }

            const user = await userModel.findByIdAndUpdate(
                req.params.id,
                { role },
                { new: true, runValidators: true }
            ).select('-password');

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            return res.status(200).json({
                success: true,
                message: "User role updated successfully",
                data: user
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    },


    DeleteUser: async (req, res) => {
        try {
            const { id } = req.params;

            // Validate the ID format
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "Invalid user ID format" });
            }

            // Find the user to be deleted
            const userToDelete = await userModel.findById(id);
            if (!userToDelete) {
                return res.status(404).json({ message: "User not found" });
            }

            // Check authorization
            const requestingUser = req.user;


            if (requestingUser.role !== 'System Admin' && requestingUser.id !== id) {
                return res.status(403).json({
                    message: "Unauthorized: You can only delete your own account unless you're an admin"
                });
            }

            // Prevent deleting the last admin
            if (userToDelete.role === 'System Admin') {
                const adminCount = await userModel.countDocuments({ role: 'System Admin' });
                if (adminCount <= 1) {
                    return res.status(400).json({
                        message: "Cannot delete the last system admin"
                    });
                }
            }

            // Perform deletion
            const deletedUser = await userModel.findByIdAndDelete(id);

            // Prepare response (don't send sensitive data)
            const response = {
                message: "User deleted successfully",
                details: {
                    id: deletedUser._id,
                    name: deletedUser.name,
                    email: deletedUser.email,
                    role: deletedUser.role
                }
            };

            res.status(200).json(response);

        } catch (error) {
            console.error("Error deleting user:", error);

            // Handle specific errors
            if (error.name === 'CastError') {
                return res.status(400).json({ message: "Invalid user ID format" });
            }

            res.status(500).json({
                message: "Error deleting user",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    GetUserBookings: async (req, res) => {
        try {
            const userId = req.user.id;

            // Validate user role
            if (req.user.role !== 'Standard User') {
                return res.status(403).json({
                    message: "Unauthorized: Only standard users can access bookings"
                });
            }

            const bookings = await Booking.find({ user: userId })
                .populate('event', 'title date location ticketPrice')
                .select('-user -__v');

            if (!bookings || bookings.length === 0) {
                return res.status(404).json({
                    message: "No bookings found for this user",
                    suggestions: [
                        "Check if you have made any bookings",
                        "Try exploring available events"
                    ]
                });
            }

            res.status(200).json({
                count: bookings.length,
                bookings: bookings.map(booking => ({
                    id: booking._id,
                    event: booking.event,
                    numberOfTickets: booking.numberOfTickets,
                    totalPrice: booking.totalPrice,
                    status: booking.status,
                    bookedAt: booking.createdAt
                }))
            });

        } catch (error) {
            console.error("Error fetching user bookings:", error);
            res.status(500).json({
                message: "Error fetching bookings",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    GetOrganizerEvents: async (req, res) => {
        try {
            const organizerId = req.user.id;

            // Validate user role
            if (req.user.role !== 'Organizer') {
                return res.status(403).json({
                    message: "Unauthorized: Only organizers can access this endpoint"
                });
            }

            const events = await Event.find({ organizer: organizerId })
                .select('-organizer -__v')
                .sort({ date: 1 }); // Sort by event date ascending

            if (!events || events.length === 0) {
                return res.status(404).json({
                    message: "No events found for this organizer",
                    suggestions: [
                        "Create your first event to get started",
                        "Check your event filters if you expected to see events"
                    ]
                });
            }

            res.status(200).json({
                count: events.length,
                upcomingEvents: events.filter(e => e.date > new Date()).length,
                pastEvents: events.filter(e => e.date <= new Date()).length,
                events: events.map(event => ({
                    id: event._id,
                    title: event.title,
                    date: event.date,
                    location: event.location,
                    category: event.category,
                    ticketPrice: event.ticketPrice,
                    ticketsAvailable: event.remainingTickets,
                    totalTickets: event.totalTickets,
                    status: event.status
                }))
            });

        } catch (error) {
            console.error("Error fetching organizer events:", error);
            res.status(500).json({
                message: "Error fetching events",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    GetOrganizerAnalytics: async (req, res) => {
        try {
            const organizerId = req.user.id;

            // Validate user role
            if (req.user.role !== 'Organizer') {
                return res.status(403).json({
                    message: "Unauthorized: Only organizers can access analytics"
                });
            }

            // Get all events for this organizer
            const events = await Event.find({ organizer: organizerId })
                .select('_id title totalTickets remainingTickets');

            if (!events || events.length === 0) {
                return res.status(404).json({
                    message: "No events found for analytics",
                    suggestions: [
                        "Create events to start generating analytics",
                        "Check back after creating your first event"
                    ]
                });
            }

            // Calculate analytics for each event
            const analytics = await Promise.all(events.map(async event => {
                const bookings = await Booking.find({
                    event: event.id,
                    status: { $ne: 'canceled' }
                });

                const ticketsSold = bookings.reduce((sum, booking) => sum + booking.numberOfTickets, 0);
                const percentageSold = (ticketsSold / event.totalTickets) * 100;

                return {
                    eventId: event._id,
                    eventTitle: event.title,
                    totalTickets: event.totalTickets,
                    ticketsSold: ticketsSold,
                    ticketsAvailable: event.remainingTickets,
                    percentageSold: percentageSold.toFixed(2),
                    revenue: ticketsSold * event.ticketPrice
                };
            }));

            // Calculate overall statistics
            const totalRevenue = analytics.reduce((sum, item) => sum + item.revenue, 0);
            const averageSoldPercentage = analytics.reduce((sum, item) => sum + parseFloat(item.percentageSold), 0) / analytics.length;

            res.status(200).json({
                totalEvents: analytics.length,
                totalRevenue: totalRevenue,
                averageSoldPercentage: averageSoldPercentage.toFixed(2),
                events: analytics.sort((a, b) => b.percentageSold - a.percentageSold)
            });

        } catch (error) {
            console.error("Error fetching organizer analytics:", error);
            res.status(500).json({
                message: "Error fetching analytics",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },  getUserProfile: async (req, res) => {
        try {
            const user = await userModel.findById(req.user.id)
                .select('-password -__v'); // Exclude sensitive fields

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            res.status(200).json(user);
        } catch (error) {
            console.error("Error fetching user profile:", error);
            res.status(500).json({
                message: "Error fetching profile",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },


    updateUserProfile: async (req, res) => {
        try {
            const { name, email, profilePicture } = req.body;
            const userId = req.user.id;

            // Find the user
            const user = await userModel.findById(userId);
            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            // Check if email is being updated and if it's already taken by another user
            if (email && email !== user.email) {
                const existingUser = await userModel.findOne({ email });
                if (existingUser) {
                    return res.status(400).json({
                        message: "Email already in use by another account"
                    });
                }
            }

            // Update the fields that are provided in the request
            if (name) user.name = name;
            if (email) user.email = email;
            if (profilePicture) user.profilePicture = profilePicture;

            // Save the updated user
            const updatedUser = await user.save();

            // Prepare the response (excluding sensitive data)
            const userResponse = {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                profilePicture: updatedUser.profilePicture,
                role: updatedUser.role,
                createdAt: updatedUser.createdAt
            };

            res.status(200).json({
                message: "Profile updated successfully",
                user: userResponse
            });

        } catch (error) {
            console.error("Error updating user profile:", error);

            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    message: "Validation error",
                    error: error.message
                });
            }

            res.status(500).json({
                message: "Error updating profile",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }





}


module.exports = UserController;
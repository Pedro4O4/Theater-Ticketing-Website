
const userModel = require("../Models/User");
const Event = require("../Models/Event");
const Booking = require("../Models/Booking");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secretKey = process.env.SECRET_KEY;
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const UserController = {



    register: async (req, res) => {
        try {
            const { email, password, name, role } = req.body;

            // Check if the user already exists
            const existingUser = await userModel.findOne({email });
            if (existingUser) {
                return res.status(409).json({ message: "User already exists" });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create a new user
            const newUser = new userModel({
                 name,
                email,
                password: hashedPassword,
                role
            });

            await userModel.insertOne(newUser);
            res.status(201).json({ message: "User registered successfully" });
        } catch (error) {
            console.error("Error registering user:", error);
            res.status(500).json({ message: "Server error" });
        }
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Find the user by email
            const user = await userModel.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: "Email not found" });
            }

            // Check if the password is correct
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ message: "Incorrect password" });
            }

            // Generate a JWT token
            const token = jwt.sign(
                { user: { userId: user._id, role: user.role } },
                secretKey,
                { expiresIn: "3h" } // Token valid for 3 hours
            );

            // Save the session in the database
            const currentDateTime = new Date();
            const expiresAt = new Date(+currentDateTime + 1800000); // 30 minutes


            // Send the token as an HTTP-only cookie and in the response body
            return res
                .cookie("token", token, {
                    expires: expiresAt,
                    httpOnly: true, // Prevent access via JavaScript
                    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
                    sameSite: "strict", // Prevent CSRF
                })
                .status(200)
                .json({
                    message: "Login successful",
                });
        } catch (error) {
            console.error("Error logging in:", error);
            res.status(500).json({ message: "Server error" });
        }
    },



    forgetPassword: async (req, res) => {
        try {
            const {email} = req.body;

            if (!email) {
                return res.status(400).json({message: "Email is required"});
            }

            const user = await userModel.findOne({email});
            if (!user) {
                return res.status(404).json({message: "User not found"});
            }

            // Generate a random 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000);
            const otpExpiration = new Date(Date.now() + 15 * 60 * 1000); // OTP valid for 15 minutes

            // Save OTP and expiration in the user's record
            user.resetOtp = otp;
            user.resetOtpExpires = otpExpiration;
            await userModel.insertOne(user);

            // Configure nodemailer transporter
            const transporter = nodemailer.createTransport({
                service: "gmail", // Use your email service
                auth: {
                    user: process.env.EMAIL_USER, // Your email
                    pass: process.env.EMAIL_PASS, // Your email password
                },
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Password Reset OTP",
                text: `Your OTP for password reset is: ${otp}. It is valid for 15 minutes.`,
            };

            // Send email
            await transporter.sendMail(mailOptions);

            res.status(200).json({message: "OTP sent to your email"});
        } catch (error) {
            if (error.code === "EAUTH") {
                res.status(500).json({
                    message: "Authentication error with email service. Please check your email credentials.",
                    error: error.message,
                });
            } else {
                res.status(500).json({
                    message: "Error generating OTP",
                    error: error.message,
                });
            }
        }
    },
    verifyOtp: async (req, res) => {
        try {
            const { email, otp } = req.body;

            if (!email || !otp) {
                return res.status(400).json({ message: "Email and OTP are required" });
            }

            const user = await userModel.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Check if OTP is valid
            if (user.resetOtp !== parseInt(otp) || user.resetOtpExpires < Date.now()) {
                return res.status(400).json({ message: "Invalid or expired OTP" });
            }

            // Generate a reset token (valid for 15 minutes)
            const resetToken = jwt.sign({ id: user._id, email: user.email }, secretKey, { expiresIn: "15m" });

            // Clear OTP fields after successful verification
            user.resetOtp = undefined;
            user.resetOtpExpires = undefined;
            await userModel.insertOne(user);

            res.status(200).json({ message: "OTP verified successfully", resetToken });
        } catch (error) {
            res.status(500).json({ message: "Error verifying OTP", error });
        }
    },
    async getAllUsers(req, res) {
        try {
            const email = req.body;
            const users = await userModel.find({email: email });
            return res.status(200).json({ success: true, data: users });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    },

    // Get single user by ID - Admin only
    async getUserById(req, res) {
        try {
            const user = await userModel.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });

            }
            console.log(req.user.id)
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
            const allowedRoles = ['Standard User', 'Organizer', 'System Admin'];
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
            const deletedUser = await userModel.findByIdAndDelete(req.params.id);

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
            const userId = req.user.userId; // Get the user ID from the request
            console.log("Fetching bookings for user:", userId);

            // Find all bookings created by the user
            const bookings = await Booking.find({"StandardId": userId});

            if (!bookings || bookings.length === 0) {
                return res.status(404).json({
                    message: "No bookings found for this user",
                    suggestions: [
                        "Check if you have made any bookings",
                        "Try exploring available events"
                    ]
                });
            }

            return res.status(200).json({ success: true, data: bookings });

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
            const organizerId = req.user.userId; // Get the organizer's ID from the request

            // Fetch all events created by the organizer
            const events = await Event.find({ organizerId })
                .select('_id title description date location category image ticketPrice totalTickets remainingTickets status');

            if (!events || events.length === 0) {
                return res.status(404).json({
                    message: "No events found for this organizer",
                    suggestions: [
                        "Create your first event to get started",
                        "Check your event filters if you expected to see events"
                    ]
                });
            }

            // Return the events
            res.status(200).json({
                count: events.length,
                events: events.map(event => ({
                    id: event._id,
                    title: event.title,
                    description: event.description,
                    date: event.date,
                    location: event.location,
                    category: event.category,
                    image: event.image,
                    ticketPrice: event.ticketPrice,
                    totalTickets: event.totalTickets,
                    remainingTickets: event.remainingTickets,
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
            const organizerId = req.user.userId;

            // Validate user role
            if (req.user.role !== 'Organizer') {
                return res.status(403).json({
                    message: "Unauthorized: Only organizers can access analytics"
                });
            }

            // Get all events for this organizer
            const events = await Event.find({  organizerId })
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
            const user = await userModel.findById(req.user.userId)
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
            const userId = req.user.userId;

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
    },


}


module.exports = UserController;
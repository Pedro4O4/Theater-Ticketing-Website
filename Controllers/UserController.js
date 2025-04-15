const userModel = require("../Models/User");
const Bookingmodle = require("../Models/Booking");
const Eventmodel = require("../Models/Event");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secretKey = process.env.SECRET_KEY;
const bcrypt = require("bcrypt");
const userController = {
        register: async (req, res) => {
            try {
                const { name, email, password } = req.body;

                // Hash the password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Create and save the new user
                const newUser = new userModel({ name, email, password: hashedPassword });
                await newUser.save();

                // Generate JWT token
                const token = jwt.sign({ id: newUser._id, email: newUser.email }, secretKey, { expiresIn: "1h" });

                // Respond with the token and user details
                res.status(201).json({ message: "User registered successfully", user: newUser, token });
            } catch (error) {
                res.status(500).json({ message: "Error registering user", error });
            }


    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Find user by email
            const user = await userModel.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Compare passwords
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
            }

            // Generate JWT token
            const token = jwt.sign({ id: user._id, email: user.email }, secretKey, { expiresIn: "1h" });
            res.status(200).json({ message: "Login successful", token });
        } catch (error) {
            res.status(500).json({ message: "Error logging in", error });
        }
    },
    forgetPassword: async (req, res) => {
        try {
            const {email} = req.body;

            // Find user by email
            if (!user) {
                return res.status(404).json({message: "User not found"});
            }

            // Generate a reset token (valid for 15 minutes)
            const resetToken = jwt.sign({id: user._id, email: user.email}, secretKey, {expiresIn: "15m"});

            // In a real-world app, you would send this token via email
            res.status(200).json({message: "Password reset token generated", resetToken});
        } catch (error) {
            res.status(500).json({message: "Error generating reset token", error});
        }
    }
}
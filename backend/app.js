const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
const cors = require("cors");
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Uploads directory created');
}

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Routers
const authRouter = require("./Routes/auth");
const UserRouters = require("./Routes/UserRouter");
const EventRouters = require("./Routes/EventRouter");
const BookingRouters = require("./Routes/BookingRouter");

// Middleware
const authenticationMiddleware = require('./Middleware/authenticationMiddleware');
const backendUrl = process.env.BACKEND_URL;

// Middlewares setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_ORIGIN,
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// For logging or generating full URLs to resources
app.get('/api/resource-url', (req, res) => {
    const resourceUrl = `${backendUrl}/api/v1/resource`;
    res.json({ url: resourceUrl });
});

// Public routes (no authentication required)
app.use("/api/v1", authRouter);

// Protected routes - apply authentication middleware to each
app.use("/api/v1/user", authenticationMiddleware, UserRouters);
app.use("/api/v1/event", authenticationMiddleware, EventRouters);
app.use("/api/v1/booking", authenticationMiddleware, BookingRouters);

// MongoDB connection
const db_url = process.env.DB_URL;
const db_name = process.env.DB_NAME || (db_url.includes('/') ? db_url.split('/').pop().split('?')[0] : 'theaterApp');

mongoose.connect(db_url)
    .then(() => console.log(`MongoDB connected to ${db_name}`))
    .catch((e) => {
        console.error("MongoDB connection error:", e.message);
    });

// Serve frontend in production
// Check if running in production and frontend exists
const frontendPath = path.join(__dirname, '../frontend/FrontendTheater/dist');
if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
    app.get("*", (req, res) => {
        res.sendFile(path.join(frontendPath, 'index.html'));
    });
} else {
    console.log('Frontend build not found at:', frontendPath);
}

// 404 handler
app.use(function (req, res, next) {
    const error = new Error("404 - Not Found");
    error.status = 404;
    next(error);
});

// Start server
app.listen(3000, () => console.log("Server started"))
    .on('error', (err) => {
        console.error("Server error:", err.message);
    });
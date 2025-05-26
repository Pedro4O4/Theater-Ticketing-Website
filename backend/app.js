const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
const cors = require("cors");
require('dotenv').config();
import path from "path";

const app = express();
const fs = require('fs');
const path = require('path');

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
const authenticationMiddleware = require('./middleware/authenticationMiddleware');

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
// In your backend Express app


// Routes
app.use("/api/v1", authRouter);
app.use("/api/v1/user", UserRouters);
app.use("/api/v1/event", EventRouters);
app.use("/api/v1/booking", BookingRouters);
app.use(authenticationMiddleware);

// MongoDB connection

const db_url = process.env.DB_URL || 'mongodb+srv://monemsomida:Monem%40010036@cluster0.izera.mongodb.net/studentsFullBack?retryWrites=true&w=majority&appName=Cluster0';
const db_name = process.env.DB_NAME || db_url.split('/')[3]?.split('?')[0] || 'studentsFullBack';

mongoose.connect(db_url)
    .then(() => console.log(`MongoDB connected to ${db_name}`))
    .catch((e) => {
        console.error("MongoDB connection error:", e.message);
    });

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'frontend/FrontendTheater/dist')));
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/FrontendTheater/dist', 'index.html'));
})
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

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
const cors = require("cors");
require('dotenv').config();

const app = express();

// Routers
const UserRouters = require("./Routes/UserRouter");
const EventRouters = require("./Routes/EventRouter");
const BookingRouters = require("./Routes/BookingRouter");
const authRouter = require("./Routes/auth");

// Middleware
const authenticationMiddleware = require('./middleware/authenticationMiddleware');

// Middlewares setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.ORIGIN,
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
}));

// Routes
app.use("/api/v1", authRouter);
app.use("/api/v1/user", UserRouters);
app.use("/api/v1/event", EventRouters);
app.use("/api/v1/booking", BookingRouters);
app.use(authenticationMiddleware);

// MongoDB connection
const db_name = process.env.DB_NAME;
const db_url = 'mongodb+srv://monemsomida:Monem%40010036@cluster0.izera.mongodb.net/studentsFullBack?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(db_url)
    .then(() => console.log(`MongoDB connected to ${db_name}`))
    .catch((e) => {
        console.error("MongoDB connection error:", e.message);
    });

// 404 handler
app.use(function (req, res, next) {
    const error = new Error("404 - Not Found");
    error.status = 404;
    next(error);
});

// Start server
app.listen(5000, () => console.log("Server started"))
    .on('error', (err) => {
        console.error("Server error:", err.message);
    });

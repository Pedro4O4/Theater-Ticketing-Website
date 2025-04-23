
const express = require("express");
const mongoose = require("mongoose");
const cookieParser=require('cookie-parser')
const cors = require("cors");

const app = express();

const UserRouters = require("./Routes/UserRouter");
const EventRouters = require("./Routes/EventRouter");
const BookingRouters = require("./Routes/BookingRouter");
const authRouter = require("./Routes/auth");
const authenticationMiddleware=require('./middleware/authenticationMiddleware')
require('dotenv').config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser())

app.use(
    cors({
        origin: process.env.ORIGIN,
        methods: ["GET", "POST", "DELETE", "PUT"],
        credentials: true,
    })
);




app.use("/api/v1", authRouter);

app.use(authenticationMiddleware);


app.use("/api/v1/user", UserRouters);
app.use("/api/v1/Event", EventRouters);
app.use("/api/v1/Booking", BookingRouters);

const db_name = process.env.DB_NAME;
const db_url = 'mongodb+srv://monemsomida:Monem%40010036@cluster0.izera.mongodb.net/studentsFullBack?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(db_url)
    .then(() => console.log(`mongoDB connected to ${db_name}`))
    .catch((e) => {
        console.log("MongoDB connection error:", e.message);
    });
app.use(function (req, res, next) {
    const error = new Error("404 - Not Found");
    error.status = 404;
    next(error);
});

// Error-handling middleware


app.listen(process.env.PORT, () => console.log("server started"))
    .on('error', (err) => {
        console.error("Server error:", err.message);
    });
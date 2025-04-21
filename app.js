
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
//app.use("/api/v1/Event", EventRouters);
app.use("/api/v1/Booking", BookingRouters);

const ItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});
const Item = mongoose.model("Item", ItemSchema);
// POST route to save data
app.post("/api/v1/items", async (req, res) => {
    try {
        // Create a new instance of the model with the request body
        const newItem = new Item(req.body);

        // Save the document to the database
        const savedItem = await newItem.save();

        // Respond with the saved document
        res.status(201).json({
            message: "Item saved successfully",
            data: savedItem
        });
    } catch (error) {
        console.error("Error saving item:", error);
        res.status(500).json({
            message: "Error saving item",
            error: error.message
        });
    }
});

const db_name = process.env.DB_NAME;
const db_url = 'mongodb+srv://monemsomida:Monem%40010036@cluster0.izera.mongodb.net/your_database_name?retryWrites=true&w=majority&appName=Cluster0';

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
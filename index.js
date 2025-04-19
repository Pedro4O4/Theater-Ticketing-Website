
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
// * Cloud Connection
const db_url = `mongodb+srv://TestUser:TestPassword@cluster0.lfqod.mongodb.net/${db_name}?retryWrites=true&w=majority`;
// * Local connection

// ! Mongoose Driver Connection



mongoose
    .connect(db_url)
    .then(() => console.log("mongoDB connected"))
    .catch((e) => {
        console.log(e);
    });

app.use(function (req, res, next) {
    return res.status(404).send("404");
});
app.listen(process.env.PORT, () => console.log(`server started at port: ${process.env.PORT}`));
const express = require('express');
const bycrypt = require('bcrypt');
const auth = express();
const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY
const user = require('../Models/User');

module.exports = function authenticationMiddleware(req, res, next) {
    const cookie = req.cookies;// if not working then last option req.headers.cookie then extract token
    console.log('inside auth middleware')
    // console.log(cookie);

    if (!cookie) {
        return res.status(401).json({message: "No Cookie provided"});
    }
    const token = cookie.token;
    if (!token) {
        return res.status(405).json({message: "No token provided"});
    }

    jwt.verify(token, secretKey, (error, decoded) => {
        if (error) {
            return res.status(403).json({message: "Invalid token"});
        }


    auth.use(express.json());



    auth.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
        req.user = decoded;
        next();
    });
};


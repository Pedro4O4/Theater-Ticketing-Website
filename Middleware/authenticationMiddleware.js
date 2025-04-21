const jwt = require("jsonwebtoken");
const {cookie} = require("express/lib/response");
const secretKey = process.env.SECRET_KEY;


module.exports = function authenticationMiddleware(req, res, next) {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, secretKey, (error, decoded) => {
        if (error) {
            return res.status(403).json({ message: "Invalid token" });
        }

        req.user = decoded.user;
        next();
    });
};
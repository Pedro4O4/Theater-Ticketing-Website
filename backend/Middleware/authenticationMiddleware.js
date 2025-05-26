const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY

module.exports = function authenticationMiddleware(req, res, next) {
    const cookie = req.cookies;
    console.log('inside auth middleware')

    if (!cookie) {
        return res.status(401).json({ message: "No Cookie provided" });
    }
    console.log("after cookie")

    const token = cookie.token;
    console.log("before token")

    if (!token) {
        return res.status(405).json({ message: "No token provided" });
    }
    console.log("after token")

    jwt.verify(token, secretKey, (error, decoded) => {
        if (error) {
            return res.status(403).json({ message: "Invalid token" });
        }
        console.log("after jwt")

        req.user = decoded.user;
        console.log(decoded.user)
        next();
    });
};
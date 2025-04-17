const express = require("express");
const authorizationMiddleware=require('../middleware/authorizationMiddleware')
const {login, register, forgetPassword} = require("../Controllers/UserController");
const router = express.Router();// * login
// Middleware to check if the user is authenticated
router.use(authorizationMiddleware);
// Route to create a new booking



router.post("/login", login);

// * register
router.post("/register", register);

// * forget password
router.post("/forgetPassword", forgetPassword);

module.exports = router;
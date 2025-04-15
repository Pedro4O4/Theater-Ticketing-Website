const express = require("express");
const authorizationMiddleware=require('../middleware/authorizationMiddleware')
const router = express.Router();// * login
// Middleware to check if the user is authenticated
router.use(authorizationMiddleware);
// Route to create a new booking



router.post("/login", UserController.login);

// * register
router.post("/register", UserController.register);

// * forget password
router.post("/forgetPassword", UserController.forgetPassword);

module.exports = router;
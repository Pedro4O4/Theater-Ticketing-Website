const express = require("express");
const {login, register,logout} = require("../Controllers/UserController");
const UserController = require("../Controllers/UserController");
const router = express.Router();// * login





router.post("/login", login);

// * register
router.post("/register", register);

// * forget password
router.put('/forgetPassword', UserController.forgetPassword);

router.post('/verify-otp', UserController["verify-otp"]);

router.post('/logout',logout)

module.exports = router;
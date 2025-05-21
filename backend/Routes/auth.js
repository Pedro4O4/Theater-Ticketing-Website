const express = require("express");
const {login, register, forgetPassword,verifyOtp,logout} = require("../Controllers/UserController");
const router = express.Router();// * login





router.post("/login", login);

// * register
router.post("/register", register);

// * forget password
router.put("/forgetPassword", forgetPassword);

router.post("/verify-otp", verifyOtp);

router.post('/logout',logout)

module.exports = router;
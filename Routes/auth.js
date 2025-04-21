const express = require("express");
const {login, register, forgetPassword} = require("../Controllers/UserController");
const router = express.Router();// * login





router.post("/login", login);

// * register
router.post("/register", register);

// * forget password
router.put("/forgetPassword", forgetPassword);

module.exports = router;
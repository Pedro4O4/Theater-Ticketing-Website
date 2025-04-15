const express = require("express");
const router = express.Router();

const userController = require("../Controllers/userController");

// * login
router.post("/login",UserController.login );
// * register
router.post("/register",UserController.register);

router.post("/forgetPassword",UserController.forgetPassword);
module.exports = router;
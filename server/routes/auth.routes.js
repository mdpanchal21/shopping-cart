const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  generateAccessToken,
  logOut,
} = require("../controller/auth.controller");

const { validate } = require("../middleware/validate");
const { registerSchema, loginSchema } = require("../validators/auth.validator");

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/newAccessToken", generateAccessToken);
router.post("/logout", logOut);

module.exports = router;

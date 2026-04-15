const express = require("express");
const router = express.Router();

const { changePassword } = require("../controller/password.controller");
const authMiddleware = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validate");
const { changePasswordSchema } = require("../validators/password.validator");

router.put("/", authMiddleware, validate(changePasswordSchema), changePassword);

module.exports = router;

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { createOrder, verifyPayment } = require("../controller/payment.controller");
const { roleMiddleware } = require("../middleware/roleMiddleware");

router.post("/create", authMiddleware, roleMiddleware("user"), createOrder);

// Authenticated verification route hit by the frontend
router.post("/verify", authMiddleware, roleMiddleware("user"), verifyPayment);

module.exports = router;

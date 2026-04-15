const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validate");
const { placeOrderSchema, cancelOrderSchema } = require("../validators/order.validator");

const {
  placeOrder,
  orderHistory,
  cancelOrder,
} = require("../controller/user.order.controller");

router.get("/", authMiddleware, orderHistory);
router.post("/", authMiddleware, validate(placeOrderSchema), placeOrder);
router.put("/", authMiddleware, validate(cancelOrderSchema), cancelOrder);

module.exports = router;

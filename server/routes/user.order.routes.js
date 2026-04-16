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
const { roleMiddleware } = require("../middleware/roleMiddleware");

router.get("/", authMiddleware, orderHistory);
router.post("/", authMiddleware, roleMiddleware("user"),  validate(placeOrderSchema), placeOrder);
router.put("/", authMiddleware, validate(cancelOrderSchema), cancelOrder);

module.exports = router;

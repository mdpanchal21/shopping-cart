const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");
const {
  getOrder,
  updateOrderStatus,
  getOrderDetail,
} = require("../controller/order.controller");

const { validate } = require("../middleware/validate");
const {
  updateOrderSchema,
} = require("../validators/admin.order.validator");

router.get("/", authMiddleware, roleMiddleware("admin"), getOrder);
router.get("/:orderId", authMiddleware, roleMiddleware("admin"), getOrderDetail);
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  validate(updateOrderSchema),
  updateOrderStatus
);

module.exports = router;

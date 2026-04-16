const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { validateParams, validateAll } = require("../middleware/validate");
const {
  addToCartSchema,
  removeFromCartSchema,
} = require("../validators/cart.validator");
const {
  addToCart,
  removeFromCart,
  getCartProduct,
} = require("../controller/user.cart.controller");
const { roleMiddleware } = require("../middleware/roleMiddleware");

router.get("/", authMiddleware, getCartProduct);
router.post("/:productId", authMiddleware, roleMiddleware("user"),validateAll(addToCartSchema), addToCart);
router.delete("/:productId", authMiddleware, validateParams(removeFromCartSchema), removeFromCart);

module.exports = router;

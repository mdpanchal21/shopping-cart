const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProduct,
  deleteProduct,
  updateProduct,
  getSingleProduct,
} = require("../controller/product.controller");

const { uploadProductImages } = require("../middleware/upload");

const { roleMiddleware } = require("../middleware/roleMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

const { validate } = require("../middleware/validate");
const {
  createProductSchema,
  updateProductSchema,
} = require("../validators/product.validator");

router.get("/", authMiddleware, roleMiddleware("admin"), getProduct);
router.get(
  "/:product_id",
  getSingleProduct,
);

router.post(
  "/",
  uploadProductImages,
  authMiddleware,
  validate(createProductSchema),
  roleMiddleware("admin"),
  createProduct,
);

router.put(
  "/:product_id",
  uploadProductImages,
  authMiddleware,
  validate(updateProductSchema),
  roleMiddleware("admin"),
  updateProduct,
);

router.delete(
  "/:product_id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteProduct,
);

module.exports = router;

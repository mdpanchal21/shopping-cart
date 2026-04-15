const express = require("express");
const router = express.Router();

const {
  createCategory,
  getCategory,
  deleteCategory,
  updateCategory
} = require("../controller/category.controller");

const authMiddleware = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");
const { validate } = require("../middleware/validate");
const {
  createCategorySchema,
  updateCategorySchema,
} = require("../validators/category.validator");

router.post(
  "/",
  validate(createCategorySchema),
  authMiddleware,
  roleMiddleware("admin"),
  createCategory,
);
router.put(
  "/",
  validate(updateCategorySchema),
  authMiddleware,
  roleMiddleware("admin"),
  updateCategory,
);
router.get("/", getCategory);
router.delete('/' , authMiddleware , roleMiddleware("admin") , deleteCategory)

module.exports = router;

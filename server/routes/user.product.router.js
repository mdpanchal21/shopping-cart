const express = require("express");
const router = express.Router();

const { validateQuery } = require("../middleware/validate");
const { getProductsQuerySchema } = require("../validators/user.product.validator");
const { getAllProducts } = require("../controller/user.product.controller");

router.get("/", validateQuery(getProductsQuerySchema), getAllProducts);

module.exports = router;

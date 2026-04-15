const express = require("express");
const router = express.Router();

const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.router");
const categoryRoutes = require("./routes/category.routes");
const userProductRoutes = require("./routes/user.product.router");
const userProfileRoutes = require("./routes/user.profile.routes");
const userCartRoutes = require("./routes/user.cart.routes");
const userOrderRoutes = require("./routes/user.order.routes");
const orderRoutes = require("./routes/order.routes");
const adminUserRoutes = require("./routes/users.route");
const passwordRoutes = require("./routes/password.routes");

router.use("/auth", authRoutes);
router.use("/product", productRoutes);
router.use("/category", categoryRoutes);
router.use("/users/products", userProductRoutes);
router.use("/users/profile", userProfileRoutes);
router.use("/users/cart", userCartRoutes);
router.use("/order", userOrderRoutes);
router.use("/orderstatus", orderRoutes);
router.use("/admin/user", adminUserRoutes);
router.use("/password", passwordRoutes);

module.exports = router;

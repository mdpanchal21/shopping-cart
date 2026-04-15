const express = require("express");
const router = express.Router();

const { getAllUsers, deleteUsers, updateUserByAdmin, getUserDetails } = require("../controller/user.controller");
const authMiddleware = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");

router.get("/", authMiddleware, roleMiddleware("admin"), getAllUsers);
router.get("/:userId", authMiddleware, roleMiddleware("admin"), getUserDetails);
router.delete("/", authMiddleware, roleMiddleware("admin"), deleteUsers);
router.patch("/:userId", authMiddleware, roleMiddleware("admin"), updateUserByAdmin);

module.exports = router;

const express = require("express");
const router = express.Router();

const { getAllUsers, chnageUserStatus, updateUserByAdmin, getUserDetails, deleteUser } = require("../controller/user.controller");
const authMiddleware = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");

router.get("/", authMiddleware, roleMiddleware("admin"), getAllUsers);
router.get("/:userId", authMiddleware, roleMiddleware("admin"), getUserDetails);
router.patch("/:userId", authMiddleware, roleMiddleware("admin"), updateUserByAdmin);
router.delete("/:userId", authMiddleware, roleMiddleware("admin"), deleteUser);

module.exports = router;

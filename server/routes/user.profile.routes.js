const express = require("express");
const router = express.Router();

const {
  getProfile,
  updateProfile,
  deleteAddress
} = require("../controller/user.profile.controller");
const authMiddleware = require("../middleware/authMiddleware");
const { uploadAvatar } = require("../middleware/upload");
const { validate, validateParams } = require("../middleware/validate");
const { updateProfileSchema, deleteAddressSchema } = require("../validators/profile.validator");

router.get("/", authMiddleware, getProfile);
router.put("/", authMiddleware, uploadAvatar, validate(updateProfileSchema), updateProfile);
router.delete("/address/:type", authMiddleware, validateParams(deleteAddressSchema), deleteAddress);

module.exports = router;

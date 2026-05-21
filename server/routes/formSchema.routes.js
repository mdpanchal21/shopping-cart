const express = require("express");
const router = express.Router();
const {
  createSchema,
  getAllSchemas,
  updateSchema,
  deleteSchema,
} = require("../controller/formSchema.controller");
const authMiddleware = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, roleMiddleware("admin"), createSchema);
router.get("/", authMiddleware, getAllSchemas);
router.put("/:entity", authMiddleware, roleMiddleware("admin"), updateSchema);
router.delete("/:entity", authMiddleware, roleMiddleware("admin"), deleteSchema);

module.exports = router;

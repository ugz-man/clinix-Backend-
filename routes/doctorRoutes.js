const express = require("express");

const authController = require("../controllers/authController");
const doctorController = require("../controllers/doctorController");

const router = express.Router();

router.use(authController.protect);
router.get("/", doctorController.getAllDoctors);
router.get("/total-count", doctorController.getTotalCount);
router.get("/:id", doctorController.getDoctor);

module.exports = router;

const express = require("express");

const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();

router.post("/signup", authController.signUp);
router.post("/signin", authController.signIn);
router.post("/signout", authController.signOut);

router.use(authController.protect);

router.get("/isloggedin", authController.isloggedIn);
router.patch(
  "/updateMe",
  userController.uploadUserPhoto,
  userController.resizeProfilePicture,
  userController.updateMe
);
module.exports = router;

const express = require("express");
const authController = require("./auth.controller");
const { requireAuth } = require("./middleware/auth.middleware");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/google", authController.googleAuth);
router.get("/lookup-student", authController.lookupStudent);
router.post("/faculty-demo", authController.facultyDemo);
router.post("/logout", authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.get("/me", requireAuth, authController.getMe);

module.exports = router;

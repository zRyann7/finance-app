const express = require("express");
const { getCurrentUser, login, logout, refreshSession, register } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  loginLimiter,
  registrationLimiter,
} = require("../middlewares/rateLimiters");

const router = express.Router();

router.post("/login", loginLimiter, login);
router.post("/register", registrationLimiter, register);
router.post("/refresh", refreshSession);
router.get("/me", authMiddleware, getCurrentUser);
router.post("/logout", authMiddleware, logout);

module.exports = router;

const express = require("express");
const { getCurrentUser, login, register } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  loginLimiter,
  registrationLimiter,
} = require("../middlewares/rateLimiters");

const router = express.Router();

router.post("/login", loginLimiter, login);
router.post("/register", registrationLimiter, register);
router.get("/me", authMiddleware, getCurrentUser);

module.exports = router;

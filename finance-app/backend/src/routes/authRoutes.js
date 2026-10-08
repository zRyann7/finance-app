const express = require("express");
const { getCurrentUser, login } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const { loginLimiter } = require("../middlewares/rateLimiters");

const router = express.Router();

router.post("/login", loginLimiter, login);
router.get("/me", authMiddleware, getCurrentUser);

module.exports = router;

const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");
const { listGoals } = require("../controllers/goalController");

const router = express.Router();

router.get("/", authMiddleware, listGoals);

module.exports = router;

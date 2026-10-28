const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");
const { getSummary } = require("../controllers/summaryController");

const router = express.Router();

router.get("/", authMiddleware, getSummary);

module.exports = router;

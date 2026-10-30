const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");
const { getSummary, getHistory } = require("../controllers/summaryController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getSummary);
router.get("/history", getHistory);

module.exports = router;

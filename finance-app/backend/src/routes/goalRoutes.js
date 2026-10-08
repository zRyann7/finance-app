const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");
const { listGoals, createGoal, updateGoal, deleteGoal } = require("../controllers/goalController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", listGoals);
router.post("/", createGoal);
router.patch("/:id", updateGoal);
router.delete("/:id", deleteGoal);

module.exports = router;

const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");

const {
  listTransactions,
  createTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", listTransactions);
router.post("/", createTransaction);
router.delete("/:id", deleteTransaction);

module.exports = router;

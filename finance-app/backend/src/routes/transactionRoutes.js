const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");

const {
  listTransactions,
  createTransaction,
} = require("../controllers/transactionController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", listTransactions);
router.post("/", createTransaction);

module.exports = router;

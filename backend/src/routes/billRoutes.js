const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");
const { listBills, createBill, updateBill, deleteBill } = require("../controllers/billController");

const router = express.Router();
router.use(authMiddleware);
router.get("/", listBills);
router.post("/", createBill);
router.patch("/:id", updateBill);
router.delete("/:id", deleteBill);

module.exports = router;

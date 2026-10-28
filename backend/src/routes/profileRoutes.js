const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");
const {
  getProfile,
  createProfile,
  updateProfile,
} = require("../controllers/profileController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getProfile);
router.post("/", createProfile);
router.patch("/", updateProfile);

module.exports = router;

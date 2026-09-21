const express = require("express");

const {
  registerUser,
  loginUser,
} = require("../controllers/authController");

const router = express.Router();
const protect = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/me", protect, async (req, res) => {
  res.status(200).json({
    message: "Authentication successful.",
    userId: req.userId,
  });
});

module.exports = router;
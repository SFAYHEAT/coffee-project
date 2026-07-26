const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { getTier, checkBadges } = require("../utils/loyalty");

const router = express.Router();

router.post("/reward", auth, async (req, res) => {
  try {
    const { score } = req.body;
    const points = Math.min(Math.max(Number(score) || 5, 5), 50);

    const user = await User.findById(req.userId);
    user.loyaltyPoints += points;
    user.tier = getTier(user.loyaltyPoints);
    user.badges = checkBadges(user);
    await user.save();

    res.json({ pointsEarned: points, totalPoints: user.loyaltyPoints });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
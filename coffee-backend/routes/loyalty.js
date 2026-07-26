const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { getTier, checkBadges } = require("../utils/loyalty");

const router = express.Router();

router.post("/checkin", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const today = new Date().toISOString().split("T")[0];

    if (user.lastVisitDate === today) {
      return res.json({ alreadyCheckedIn: true, points: user.loyaltyPoints, tier: user.tier, streak: user.visitStreak, badges: user.badges });
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    user.visitStreak = user.lastVisitDate === yesterday ? user.visitStreak + 1 : 1;
    user.lastVisitDate = today;
    user.loyaltyPoints += 10;

    if (user.birthday) {
      const todayMD = today.slice(5);
      const bdayMD = user.birthday.slice(5);
      if (todayMD === bdayMD) user.loyaltyPoints += 100;
    }

    user.tier = getTier(user.loyaltyPoints);
    user.badges = checkBadges(user);
    await user.save();

    res.json({ alreadyCheckedIn: false, pointsEarned: 10, points: user.loyaltyPoints, tier: user.tier, streak: user.visitStreak, badges: user.badges });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/status", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ points: user.loyaltyPoints, tier: user.tier, streak: user.visitStreak, badges: user.badges });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/leaderboard", async (req, res) => {
  try {
    const top = await User.find().sort({ loyaltyPoints: -1 }).limit(10).select("name loyaltyPoints tier");
    res.json(top);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
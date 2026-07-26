const express = require("express");
const User = require("../models/User");
const WheelPrize = require("../models/WheelPrize");
const auth = require("../middleware/auth");

const router = express.Router();

function pickWeighted(prizes) {
  const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const p of prizes) {
    rand -= p.weight;
    if (rand <= 0) return p;
  }
  return prizes[0];
}

router.get("/status", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const today = new Date().toISOString().split("T")[0];
    res.json({ canSpin: user.lastSpinDate !== today });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/spin", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const today = new Date().toISOString().split("T")[0];
    if (user.lastSpinDate === today) return res.status(409).json({ message: "Already spun today" });

    const prizes = await WheelPrize.find({ active: true });
    if (!prizes.length) return res.status(404).json({ message: "No prizes available" });

    const won = pickWeighted(prizes);
    user.lastSpinDate = today;
    if (won.type === "points") user.loyaltyPoints += Number(won.value) || 0;
    await user.save();

    res.json({ prize: won });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
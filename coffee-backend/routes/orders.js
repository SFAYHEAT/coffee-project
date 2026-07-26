const express = require("express");
const Order = require("../models/Order");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { getTier, checkBadges } = require("../utils/loyalty");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const { items, total, tableNumber } = req.body;
    if (!items || !items.length || !tableNumber) {
      return res.status(400).json({ message: "Missing order data" });
    }

    const order = await Order.create({ user: req.userId, tableNumber, items, total });

    const user = await User.findById(req.userId);
    user.loyaltyPoints += Math.floor(total);
    user.tier = getTier(user.loyaltyPoints);
    user.badges = checkBadges(user);
    await user.save();

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// IMPORTANT: static routes must come BEFORE the "/:id" route
router.get("/last", auth, async (req, res) => {
  try {
    const order = await Order.findOne({ user: req.userId }).sort({ createdAt: -1 });
    if (!order) return res.status(404).json({ message: "No orders found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/active", auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      user: req.userId,
      status: { $nin: ["completed", "cancelled"] },
    }).sort({ createdAt: -1 });

    if (!order) return res.status(404).json({ message: "No active order" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/history", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.userId });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
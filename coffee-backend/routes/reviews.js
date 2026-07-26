const express = require("express");
const Review = require("../models/Review");
const auth = require("../middleware/auth");
const Order = require("../models/Order");
const User = require("../models/User");
const router = express.Router();

router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate("user", "name avatar").sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/trending", async (req, res) => {
  try {
    const trending = await Review.aggregate([
      { $group: { _id: "$product", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    res.json(trending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { productId, rating, comment, photoUrl } = req.body;
    if (!productId || !rating) return res.status(400).json({ message: "Missing fields" });

    const user = await User.findById(req.userId);
    if (user.currentTable) {
      return res.status(403).json({ message: "You can review after you finish your visit (leave your table)" });
    }

    const hasOrdered = await Order.exists({ user: req.userId });
    if (!hasOrdered) {
      return res.status(403).json({ message: "You need to order first before leaving a review" });
    }

    const review = await Review.create({ product: productId, user: req.userId, rating, comment, photoUrl });
    const populated = await review.populate("user", "name avatar");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/like", auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Not found" });

    const idx = review.likes.indexOf(req.userId);
    if (idx === -1) review.likes.push(req.userId);
    else review.likes.splice(idx, 1);
    await review.save();

    res.json({ likes: review.likes.length, liked: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
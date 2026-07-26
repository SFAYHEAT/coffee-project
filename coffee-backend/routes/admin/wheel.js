const express = require("express");
const WheelPrize = require("../../models/WheelPrize");
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    res.json(await WheelPrize.find({ active: true }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", auth, admin, async (req, res) => {
  try {
    res.status(201).json(await WheelPrize.create(req.body));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", auth, admin, async (req, res) => {
  try {
    res.json(await WheelPrize.findByIdAndUpdate(req.params.id, req.body, { new: true }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", auth, admin, async (req, res) => {
  try {
    await WheelPrize.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
const express = require("express");
const Topping = require("../../models/Topping");
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    res.json(await Topping.find());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", auth, admin, async (req, res) => {
  try {
    res.status(201).json(await Topping.create(req.body));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", auth, admin, async (req, res) => {
  try {
    res.json(await Topping.findByIdAndUpdate(req.params.id, req.body, { new: true }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", auth, admin, async (req, res) => {
  try {
    await Topping.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
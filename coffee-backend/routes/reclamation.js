const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const Reclamation = require("../models/Reclamation");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Message required" });

    let thread = await Reclamation.findOne({ user: req.userId, status: "open" });
    if (!thread) thread = await Reclamation.create({ user: req.userId, messages: [] });

    thread.messages.push({ sender: "user", text: message });
    await thread.save();

    res.json(thread);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/mine", auth, async (req, res) => {
  try {
    const thread = await Reclamation.findOne({ user: req.userId, status: "open" });
    res.json(thread || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", auth, admin, async (req, res) => {
  try {
    const threads = await Reclamation.find().populate("user", "name email").sort({ updatedAt: -1 });
    res.json(threads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/reply", auth, admin, async (req, res) => {
  try {
    const { message } = req.body;
    const thread = await Reclamation.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: "Thread not found" });

    thread.messages.push({ sender: "admin", text: message });
    await thread.save();

    res.json(thread);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/close", auth, admin, async (req, res) => {
  try {
    await Reclamation.findByIdAndUpdate(req.params.id, { status: "closed" });
    res.json({ message: "Closed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
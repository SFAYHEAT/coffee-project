const express = require("express");
const Table = require("../models/Table");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/:tableNumber", async (req, res) => {
  try {
    const table = await Table.findOne({ tableNumber: req.params.tableNumber });
    if (!table || !table.active) return res.status(404).json({ message: "Table not found" });
    res.json(table);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:tableNumber/claim", auth, async (req, res) => {
  try {
    const table = await Table.findOne({ tableNumber: req.params.tableNumber });
    if (!table || !table.active) return res.status(404).json({ message: "Table not found" });
    if (table.occupied && String(table.currentUser) !== req.userId) {
      return res.status(409).json({ message: "Table already in use" });
    }

    table.occupied = true;
    table.currentUser = req.userId;
    await table.save();
    await User.findByIdAndUpdate(req.userId, { currentTable: table.tableNumber });

    res.json(table);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/release", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user?.currentTable) {
      await Table.findOneAndUpdate({ tableNumber: user.currentTable }, { occupied: false, currentUser: null });
      user.currentTable = null;
      await user.save();
    }
    res.json({ message: "Table released" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
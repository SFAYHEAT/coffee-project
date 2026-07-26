const express = require("express");
const Table = require("../../models/Table");
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");

const router = express.Router();
const QRCode = require("qrcode");
router.get("/", auth, admin, async (req, res) => {
  try {
    res.json(await Table.find());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", auth, admin, async (req, res) => {
  try {
    res.status(201).json(await Table.create(req.body));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", auth, admin, async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!table) return res.status(404).json({ message: "Not found" });
    res.json(table);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
const express = require("express");
const Reservation = require("../models/Reservation");
const Table = require("../models/Table");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/available", async (req, res) => {
  try {
    const { date, time } = req.query;
    const tables = await Table.find({ active: true });
    const booked = await Reservation.find({ date, time, status: "confirmed" });
    const bookedNumbers = booked.map((r) => r.tableNumber);
    res.json(tables.filter((t) => !bookedNumbers.includes(t.tableNumber)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { tableNumber, date, time, partySize } = req.body;
    if (!tableNumber || !date || !time || !partySize) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const clash = await Reservation.findOne({ tableNumber, date, time, status: "confirmed" });
    if (clash) return res.status(409).json({ message: "Table already booked for this slot" });

    const reservation = await Reservation.create({ user: req.userId, tableNumber, date, time, partySize });
    res.status(201).json(reservation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/mine", auth, async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.userId }).sort({ date: 1 });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: "Not found" });
    if (String(reservation.user) !== req.userId) return res.status(403).json({ message: "Not your reservation" });

    reservation.status = "cancelled";
    await reservation.save();
    res.json({ message: "Cancelled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
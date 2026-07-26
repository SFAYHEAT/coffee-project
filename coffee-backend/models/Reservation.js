const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tableNumber: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    partySize: { type: Number, required: true },
    status: { type: String, default: "confirmed" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Reservation", reservationSchema);
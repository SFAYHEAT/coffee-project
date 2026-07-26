const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    tableNumber: { type: String, required: true, unique: true },
    qrCode: { type: String, required: true },
    active: { type: Boolean, default: true },
    occupied: { type: Boolean, default: false },
    currentUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Table", tableSchema);
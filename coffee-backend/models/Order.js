// models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tableNumber: { type: String, required: true },
    items: [{ id: String, productId: String, name: String, price: Number, qty: Number }],
    total: { type: Number, required: true },
    status: { type: String, default: "pending" },
    paid: { type: Boolean, default: false },
    paidAt: { type: Date, default: null },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
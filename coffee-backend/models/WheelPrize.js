const mongoose = require("mongoose");

const wheelPrizeSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    type: { type: String, enum: ["discount", "freeItem", "points", "coupon"], required: true },
    value: { type: String, required: true },
    weight: { type: Number, default: 1 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("WheelPrize", wheelPrizeSchema);
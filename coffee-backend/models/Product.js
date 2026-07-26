const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    origin: { type: String, default: "" },
    roastLevel: { type: Number, default: 5 },
    tastingNotes: { type: [String], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
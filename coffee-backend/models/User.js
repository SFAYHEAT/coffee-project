// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: null },
    currentTable: { type: String, default: null },
    isAdmin: { type: Boolean, default: false },
    role: { type: String, enum: ["client", "cashier", "admin"], default: "client" },
    lastSpinDate: { type: String, default: null },
    loyaltyPoints: { type: Number, default: 0 },
    tier: { type: String, default: "Bronze" },
    visitStreak: { type: Number, default: 0 },
    lastVisitDate: { type: String, default: null },
    birthday: { type: String, default: null },
    badges: { type: [String], default: [] },
    assistantWarnings: { type: Number, default: 0 },
    assistantBlockedUntil: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
const mongoose = require("mongoose");

const reclamationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    messages: [
      {
        sender: { type: String, enum: ["user", "admin"], required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    status: { type: String, default: "open" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Reclamation", reclamationSchema);
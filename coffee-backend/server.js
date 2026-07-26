require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Coffee Backend API running ☕" });
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", require("./routes/User"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/tables", require("./routes/tables"));
app.use("/api/reservations", require("./routes/reservations"));
app.use("/api/reclamation", require("./routes/reclamation"));
app.use("/api/upload", require("./routes/upload"));
app.use("/uploads", express.static("uploads"));
app.use("/api/wheel", require("./routes/wheel"));
app.use("/api/loyalty", require("./routes/loyalty"));
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/assistant", require("./routes/assistant"));
app.use("/api/games", require("./routes/games"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/recommend", require("./routes/recommend"));
// server.js — add this line where you register other routers
app.use("/api/cashier", require("./routes/cashier"));
app.use("/api/admin/products", require("./routes/admin/products"));
app.use("/api/admin/tables", require("./routes/admin/tables"));
app.use("/api/admin/users", require("./routes/admin/users"));
app.use("/api/admin/toppings", require("./routes/admin/toppings"));
app.use("/api/admin/wheel", require("./routes/admin/wheel"));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
// middleware/requireCashier.js
const User = require("../models/User");

module.exports = async function requireCashier(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user || !(user.role === "cashier" || user.role === "admin" || user.isAdmin)) {
      return res.status(403).json({ message: "Cashier access only" });
    }
    req.cashier = user;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
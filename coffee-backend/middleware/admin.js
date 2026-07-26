const User = require("../models/User");

module.exports = async function (req, res, next) {
  const user = await User.findById(req.userId);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
const express = require("express");
const Order = require("../models/Order");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/me", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId });
    const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
    const totalCoffees = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0), 0);

    const itemCounts = {};
    const tableCounts = {};
    const dayCounts = {};

    const now = new Date();
    let visitsThisMonth = 0;

    orders.forEach((o) => {
      o.items.forEach((i) => { itemCounts[i.name] = (itemCounts[i.name] || 0) + i.qty; });
      tableCounts[o.tableNumber] = (tableCounts[o.tableNumber] || 0) + 1;

      const created = new Date(o.createdAt);
      const day = created.toLocaleDateString("en-US", { weekday: "long" });
      dayCounts[day] = (dayCounts[day] || 0) + 1;

      if (created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()) visitsThisMonth++;
    });

    const favoriteDrink = Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    const favoriteTable = Object.entries(tableCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    const mostVisitedDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    res.json({ totalCoffees, totalSpent, favoriteDrink, visitsThisMonth, mostVisitedDay, favoriteTable, totalOrders: orders.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
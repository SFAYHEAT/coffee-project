// routes/cashier.js
const express = require("express");
const Order = require("../models/Order");
const Table = require("../models/Table");
const User = require("../models/User");
const auth = require("../middleware/auth");
const requireCashier = require("../middleware/requireCashier");

const router = express.Router();
router.use(auth, requireCashier);

// Tables overview: occupied state + active order per table
router.get("/tables", async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    const activeOrders = await Order.find({ status: { $nin: ["completed", "cancelled"] } });

    const data = tables.map((t) => {
      const order = activeOrders.find((o) => o.tableNumber === t.tableNumber);
      return {
        _id: t._id,
        tableNumber: t.tableNumber,
        occupied: t.occupied,
        active: t.active,
        order: order
          ? { _id: order._id, status: order.status, total: order.total, items: order.items, createdAt: order.createdAt }
          : null,
      };
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// All orders, optional filters
router.get("/orders", async (req, res) => {
  try {
    const { status, date, paid } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (paid !== undefined) filter.paid = paid === "true";
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    }
    const orders = await Order.find(filter).populate("user", "name email").sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update order status
router.patch("/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "preparing", "ready", "completed", "cancelled"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Change order's table
router.patch("/orders/:id/table", async (req, res) => {
  try {
    const { tableNumber } = req.body;
    if (!tableNumber) return res.status(400).json({ message: "tableNumber required" });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const newTable = await Table.findOne({ tableNumber });
    if (!newTable || !newTable.active) return res.status(404).json({ message: "Target table not found" });

    const oldTableNumber = order.tableNumber;
    order.tableNumber = tableNumber;
    await order.save();

    await Table.findOneAndUpdate({ tableNumber: oldTableNumber }, { occupied: false, currentUser: null });
    newTable.occupied = true;
    newTable.currentUser = order.user;
    await newTable.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark order paid + release table
router.post("/orders/:id/pay", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.paid = true;
    order.paidAt = new Date();
    order.paidBy = req.userId;
    if (order.status !== "cancelled") order.status = "completed";
    await order.save();

    await Table.findOneAndUpdate(
      { tableNumber: order.tableNumber },
      { occupied: false, currentUser: null },
    );
    await User.findByIdAndUpdate(order.user, { currentTable: null });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Stats: per-table, per-hour, totals for a given day (default today)
router.get("/stats", async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const orders = await Order.find({ paid: true, paidAt: { $gte: start, $lte: end } });

    const totalEarned = orders.reduce((s, o) => s + o.total, 0);
    const orderCount = orders.length;

    const byTable = {};
    const byHour = Array(24).fill(0);

    orders.forEach((o) => {
      byTable[o.tableNumber] = (byTable[o.tableNumber] || 0) + o.total;
      const h = new Date(o.paidAt).getHours();
      byHour[h] += o.total;
    });

    // last 7 days totals
    const weekAgo = new Date(start);
    weekAgo.setDate(weekAgo.getDate() - 6);
    const weekOrders = await Order.find({ paid: true, paidAt: { $gte: weekAgo, $lte: end } });
    const byDay = {};
    weekOrders.forEach((o) => {
      const key = new Date(o.paidAt).toISOString().slice(0, 10);
      byDay[key] = (byDay[key] || 0) + o.total;
    });

    res.json({
      date: start.toISOString().slice(0, 10),
      totalEarned,
      orderCount,
      avgOrder: orderCount ? totalEarned / orderCount : 0,
      byTable,
      byHour,
      byDay,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Export raw data for a given day (orders, users involved, tables)
router.get("/export", async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const orders = await Order.find({ createdAt: { $gte: start, $lte: end } })
      .populate("user", "name email")
      .sort({ createdAt: 1 });

    const tables = await Table.find();

    const userIds = [...new Set(orders.map((o) => o.user?._id?.toString()).filter(Boolean))];
    const users = await User.find({ _id: { $in: userIds } }).select("name email loyaltyPoints tier");

    res.json({
      date: start.toISOString().slice(0, 10),
      generatedAt: new Date(),
      totalEarned: orders.filter((o) => o.paid).reduce((s, o) => s + o.total, 0),
      orders,
      tables,
      users,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
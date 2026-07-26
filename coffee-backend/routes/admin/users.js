const express = require("express");
const User = require("../../models/User");
const Order = require("../../models/Order");
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");

const router = express.Router();

router.get("/", auth, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    const orders = await Order.find();

    const data = users.map((u) => {
      const userOrders = orders.filter((o) => String(o.user) === String(u._id));
      const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);
      return { ...u.toObject(), totalSpent, orderCount: userOrders.length };
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/stats", auth, admin, async (req, res) => {
  try {
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const userCount = await User.countDocuments();
    res.json({ totalRevenue, orderCount: orders.length, userCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// UPDATE USER
router.put("/:id", auth, admin, async (req, res) => {
  try {

    const user = await User.findById(req.params.id);
    if(
String(req.userId) === String(user._id)
&& req.body.isAdmin === false
){
return res.status(400).json({
message:"You cannot remove your own admin access"
});
}
    if (!user) {
      return res.status(404).json({
        message:"User not found"
      });
    }


    if(req.body.name !== undefined)
      user.name = req.body.name;


    if(req.body.email !== undefined)
      user.email = req.body.email;


    if(req.body.isAdmin !== undefined)
      user.isAdmin = req.body.isAdmin;


    if(req.body.loyaltyPoints !== undefined)
      user.loyaltyPoints = req.body.loyaltyPoints;


    if(req.body.tier !== undefined)
      user.tier = req.body.tier;

    if(req.body.role !== undefined)
      user.role = req.body.role;


    await user.save();


    res.json(
      user.toObject({
        transform:(doc,ret)=>{
          delete ret.password;
          return ret;
        }
      })
    );


  } catch(err){

    res.status(500).json({
      message:err.message
    });

  }
});
// DELETE USER
router.delete("/:id", auth, admin, async (req, res) => {
  try {

    const user = await User.findByIdAndDelete(req.params.id);


    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }


    res.json({
      message: "User deleted",
    });


  } catch (err) {

    res.status(500).json({
      message: err.message,
    });

  }
});
const Review = require("../../models/Review");

router.get("/analytics/detailed", auth, admin, async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
    const reviews = await Review.find().populate("user", "name").populate("product", "name").sort({ createdAt: -1 });

    const productCounts = {};
    orders.forEach((o) => {
      o.items.forEach((i) => {
        const baseName = i.name.split(" (")[0];
        productCounts[baseName] = (productCounts[baseName] || 0) + i.qty;
      });
    });
    const topProducts = Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const formattedOrders = orders.map((o) => ({
      _id: o._id,
      customer: o.user?.name || "Unknown",
      email: o.user?.email || "",
      tableNumber: o.tableNumber,
      items: o.items,
      total: o.total,
      date: o.createdAt,
    }));

    const formattedReviews = reviews.map((r) => ({
      _id: r._id,
      customer: r.user?.name || "Unknown",
      product: r.product?.name || "Unknown",
      rating: r.rating,
      comment: r.comment,
      date: r.createdAt,
    }));

    res.json({ orders: formattedOrders, topProducts, reviews: formattedReviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;
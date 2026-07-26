const express = require("express");
const router = express.Router();

const Product = require("../models/Product");


// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({
      createdAt: -1,
    });

    res.json(products);

  } catch (err) {
    console.error("LOAD PRODUCTS ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});


// GET ONE PRODUCT
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});


module.exports = router;
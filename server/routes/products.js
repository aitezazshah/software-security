const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// Create Product
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== "seller") {
      return res
        .status(403)
        .json({ message: "Only sellers can create products" });
    }

    const { name, description, price, quantity, image } = req.body;

    if (!name || !price || !quantity) {
      return res
        .status(400)
        .json({ message: "Name, price and quantity are required" });
    }

    const product = new Product({
      name,
      description,
      price,
      quantity,
      image,
      seller: req.userId,
    });

    await product.save();
    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get All Products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("seller", "fullName");
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

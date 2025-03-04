const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const User = require("../models/User");
const Purchase = require("../models/Purchase");
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

// Delete Products

// Delete Product (Seller only)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (user.role !== "seller" || product.seller.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Modify purchase route
router.post("/:id/purchase", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== "buyer") {
      return res
        .status(403)
        .json({ message: "Only buyers can purchase products" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.quantity < 1)
      return res.status(400).json({ message: "Product out of stock" });

    // Create purchase record
    const purchase = new Purchase({
      user: req.userId,
      product: product._id,
      quantity: 1, // Or get from request if variable quantity
      totalPrice: product.price,
    });

    // Update product quantity
    product.quantity -= 1;

    await Promise.all([product.save(), purchase.save()]);

    res.status(200).json({
      message: "Purchase successful",
      updatedProduct: product,
      purchase,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
module.exports = router;

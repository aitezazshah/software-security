const express = require("express");
const router = express.Router();
const Purchase = require("../models/Purchase");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/history", authMiddleware, async (req, res) => {
  try {
    const purchases = await Purchase.find({ user: req.userId })
      .populate("product", "name price image")
      .sort({ purchaseDate: -1 });

    res.status(200).json(purchases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

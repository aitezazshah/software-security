const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Product = require("../models/Product");
const Contact = require("../models/Contact");
const authMiddleware = require("../middleware/authMiddleware");
// const adminMiddleware = require("../middleware/adminMiddleware");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// router.get("/check-admin", authMiddleware, adminMiddleware, (req, res) => {
//   res.json({ isAdmin: true });
// });

// Admin Login
router.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await User.findOne({
      email,
      role: { $in: ["admin", "SuperAdmin"] },
    });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "500h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({ message: "Admin logged in", user: admin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/contacts", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contact requests" });
  }
});

router.get("/get-admin", async (req, res) => {
  try {
    const admins = await User.find({
      role: { $in: ["admin", "SuperAdmin"] },
    }).select("-password"); // Exclude password field
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch admins" });
  }
});

router.post("/create-admin", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new User({
      fullName,
      email,
      password: hashedPassword,
      role: "admin",
    });
    await newAdmin.save();

    res
      .status(201)
      .json({ message: "Admin added successfully", admin: newAdmin });
  } catch (err) {
    res.status(500).json({ error: "Failed to create admin" });
    console.error(err);
  }
});

// Delete an admin (Super Admin cannot be deleted)
router.delete("/delete-admins/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await User.findById(id);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    if (admin.role === "SuperAdmin") {
      return res.status(403).json({ error: "Super Admin cannot be deleted" });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: "Admin deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete admin" });
  }
});

// User Management
router.get("/users", authMiddleware, async (req, res) => {
  const users = await User.find({
    role: { $nin: ["admin", "SuperAdmin"] },
  }).sort({
    createdAt: -1,
  }); // Add sorting
  res.json(users);
});

router.post("/admin-logout", authMiddleware, (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ message: "Logged out successfully" });
});

router.put("/users/:id", authMiddleware, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, {
    isDisabled: req.body.disabled, // Ensure field name matches model
  });
  res.json({ message: "User updated" });
});

// Seller Approvals
router.get("/sellers", authMiddleware, async (req, res) => {
  const pendingSellers = await User.find({ role: "seller", isApproved: false });
  res.json(pendingSellers);
});

router.put("/sellers/:id/approve", authMiddleware, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isApproved: true });
  res.json({ message: "Seller approved" });
});

// Create New Admin
router.post("/create-admin", authMiddleware, async (req, res) => {
  if (req.user._id.toString() === req.body.userId) {
    return res.status(400).json({ message: "Cannot modify yourself" });
  }

  const newAdmin = await User.findByIdAndUpdate(req.body.userId, {
    role: "admin",
  });
  res.json({ message: "Admin created", user: newAdmin });
});

// Product Management
router.get("/products", authMiddleware, async (req, res) => {
  const products = await Product.find().populate("seller");
  res.json(products);
});

router.delete("/products/:id", authMiddleware, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
});

module.exports = router;

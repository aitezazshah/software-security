require("dotenv").config(); // Load environment variables at the top
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const purchaseRoutes = require("./routes/purchases");
const adminRoutes = require("./routes/admin");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/admin", adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Handle undefined routes
app.use((req, res) => {
  res.status(404).send("Route not found");
});

// Ensure MongoDB connects first
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Create default admin after DB connection is established
  createDefaultAdmin();
});

// Function to create default admin
const createDefaultAdmin = async () => {
  const User = require("./models/User");

  try {
    const adminExists = await User.findOne({
      email: process.env.DEFAULT_ADMIN_EMAIL,
    });

    if (!adminExists) {
      const admin = new User({
        fullName: "Super Admin",
        email: process.env.DEFAULT_ADMIN_EMAIL,
        password: process.env.DEFAULT_ADMIN_PASSWORD, // Let the schema handle hashing
        role: "SuperAdmin",
        isApproved: true,
      });

      await admin.save();
      console.log("Default admin created successfully");
    } else {
      console.log("Admin already exists");
    }
  } catch (error) {
    console.error("Error creating admin:", error);
  }
};

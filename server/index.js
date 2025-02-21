require("dotenv").config(); // This must be at the top of the file
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");

const app = express();

const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Basic route to test server
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Connect to MongoDB
connectDB();

// Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Handle undefined routes
app.use((req, res) => {
  res.status(404).send("Route not found");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
  },
  message: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: [/^\+?\d{10,15}$/, "Invalid phone number"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Contact", ContactSchema);

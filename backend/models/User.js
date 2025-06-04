const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ADMIN", "UNIT_MANAGER", "USER"],
      default: "USER",
    },
    createdBy: {
      type: String,
      ref: "User",
    },
    group: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;

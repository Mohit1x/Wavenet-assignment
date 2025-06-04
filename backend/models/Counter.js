const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  role: { type: String, required: true, unique: true },
  count: { type: Number, default: 1 },
});

module.exports = mongoose.model("Counter", counterSchema);

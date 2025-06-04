const Counter = require("../models/Counter");

async function generateUserId(role) {
  const prefixMap = {
    ADMIN: "A",
    UNIT_MANAGER: "UM",
    USER: "U",
  };

  const prefix = prefixMap[role];
  if (!prefix) return null;

  const counter = await Counter.findOneAndUpdate(
    { role },
    { $inc: { count: 1 } },
    { new: true, upsert: true }
  );

  return `${prefix}${counter.count}`;
}

module.exports = generateUserId;

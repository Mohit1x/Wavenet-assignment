let adminCount = 1;
let managerCount = 1;
let userCount = 1;

function generateUserId(role) {
  if (role === "ADMIN") return `A${adminCount++}`;
  if (role === "UNIT_MANAGER") return `UM${managerCount++}`;
  if (role === "USER") return `U${userCount++}`;
  return null;
}

module.exports = generateUserId;

const express = require("express");
const router = express.Router();

const {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} = require("../controllers/UserController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.post(
  "/create",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "ADMIN", "UNIT_MANAGER"),
  createUser
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "ADMIN", "UNIT_MANAGER"),
  getUsers
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "ADMIN", "UNIT_MANAGER"),
  updateUser
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "ADMIN", "UNIT_MANAGER"),
  deleteUser
);

module.exports = router;

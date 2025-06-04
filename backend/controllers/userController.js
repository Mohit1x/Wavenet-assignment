const User = require("../models/User");
const bcrypt = require("bcrypt");
const generateUserId = require("../utils/generateUserId");

const createUser = async (req, res) => {
  try {
    const creatorRole = req.user.role;
    const creatorId = req.user.userId;
    const { name, email, password, role, group } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const roleRules = {
      SUPER_ADMIN: ["ADMIN"],
      ADMIN: ["UNIT_MANAGER"],
      UNIT_MANAGER: ["USER"],
      USER: [],
    };

    if (!roleRules[creatorRole]?.includes(role)) {
      return res
        .status(403)
        .json({ message: "You are not allowed to create this role" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await generateUserId(role);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      group,
      userId,
      createdBy: req.user.userId,
    });

    const userResponse = { ...newUser.toObject() };
    delete userResponse.password;

    res
      .status(201)
      .json({ message: "User created successfully", user: userResponse });
  } catch (error) {
    console.error("Create User Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role: filterRole, search } = req.query;
    const userRole = req.user.role;
    const userId = req.user.userId;

    const query = {};

    if (userRole === "SUPER_ADMIN") {
    } else if (userRole === "ADMIN") {
      query.$or = [{ createdBy: userId }, { group: req.user.group }];
    } else if (userRole === "UNIT_MANAGER") {
      query.$or = [{ createdBy: userId }, { group: req.user.group }];
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    if (filterRole) {
      query.role = filterRole;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { userId: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .populate("createdBy", "name userId")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const userRole = req.user.role;

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    const roleRules = {
      SUPER_ADMIN: ["ADMIN"],
      ADMIN: ["UNIT_MANAGER"],
      UNIT_MANAGER: ["USER"],
      USER: [],
    };

    if (!roleRules[userRole]?.includes(role)) {
      return res
        .status(403)
        .json({ message: "You are not allowed to assign this role" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createUser, getUsers, updateUser, deleteUser };

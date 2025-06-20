const User = require("../models/User");
const bcrypt = require("bcrypt");
const generateUserId = require("../utils/generateUserId");

const createUser = async (req, res) => {
  try {
    const creatorRole = req.user.role;
    const { name, email, password, role, group } = req.body;

    if (!name?.trim()?.length || !email?.trim()?.length || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password?.trim()?.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be of atleast 6 charecters." });
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
      createdBy: req.user._id,
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

    const baseFilter = [];

    if (userRole === "SUPER_ADMIN") {
      // SUPER_ADMIN can see everything, so no filter needed
    } else if (userRole === "ADMIN" || userRole === "UNIT_MANAGER") {
      baseFilter.push({
        $or: [{ createdBy: userId }, { group: req.user.group }],
      });
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    if (filterRole) {
      baseFilter.push({ role: filterRole });
    }

    if (search) {
      baseFilter.push({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { userId: { $regex: search, $options: "i" } },
        ],
      });
    }

    const query = baseFilter.length > 0 ? { $and: baseFilter } : {};

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

    if (req.userId === id) {
      return res
        .status(400)
        .json({ message: "You are not allowed to do this action" });
    }

    const roleRules = {
      SUPER_ADMIN: ["SUPER_ADMIN", "ADMIN", "UNIT_MANAGER", "USER"],
      ADMIN: ["UNIT_MANAGER", "USER"],
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

    if (req.userId === id) {
      return res
        .status(400)
        .json({ message: "You are not allowed to do this action" });
    }

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

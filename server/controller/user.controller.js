const User = require("../model/User.model");
const Order = require("../model/Orders.model");

exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    let query = {};

    if (search) {
      query = {
        $or: [
          { firstname: { $regex: search, $options: "i" } },
          { lastname: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await User.find(query, {
      firstname: 1,
      lastname: 1,
      email: 1,
      isActive: 1,
      role: 1,
      createdAt: 1,
      avatar: 1,
    })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .select()
      .lean();

    if (!users || users.length === 0) {
      return res.status(200).json({
        message: "No users found",
        data: [],
        totalPages: 0,
        totalUsers: 0,
        currentPage: page,
      });
    }

    return res.status(200).json({
      message: "Users fetched successfully",
      data: users,
      totalPages,
      totalUsers,
      currentPage: page,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error while fetching users",
      error: err.message,
    });
  }
};

exports.updateUserByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true },
    ).select("-password -refreshToken");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User profile updated successfully by admin",
      data: updatedUser,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error while updating user profile",
      error: err.message,
    });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select("-password -refreshToken -__v")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const orders = await Order.find({ createdBy: userId })
      .select("-createdBy -isActive -__v")
      .populate({
        path: "products.product",
        select: "-isActive -__v -createdAt -updatedAt",
        populate: {
          path: "category",
          select: "name slug -_id",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "User detail fetched successfully",
      data: { ...user, orders },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error while fetching user detail",
      error: err.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User account permanently deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error while deleting user",
      error: err.message,
    });
  }
};

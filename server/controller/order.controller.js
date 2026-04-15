const Order = require("../model/Orders.model");
const User = require("../model/User.model");
const mongoose = require("mongoose");

exports.getOrder = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    let query = {};

    if (search) {
      const orConditions = [];

      const cleanSearch = search.replace(/^#/, "").trim();
      if (/^[a-fA-F0-9]+$/.test(cleanSearch)) {
        const allOrders = await Order.find({}, "_id").lean();
        const matchingIds = allOrders
          .filter((o) => o._id.toString().toLowerCase().includes(cleanSearch.toLowerCase()))
          .map((o) => o._id);
        if (matchingIds.length > 0) {
          orConditions.push({ _id: { $in: matchingIds } });
        }
      }

      const matchingUsers = await User.find({
        $or: [
          { firstname: { $regex: search, $options: "i" } },
          { lastname: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      if (matchingUsers.length > 0) {
        orConditions.push({
          createdBy: { $in: matchingUsers.map((u) => u._id) },
        });
      }

      const statusValues = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
      const matchingStatuses = statusValues.filter((s) =>
        s.includes(search.toLowerCase())
      );
      if (matchingStatuses.length > 0) {
        orConditions.push({ status: { $in: matchingStatuses } });
      }

      if (orConditions.length > 0) {
        query = { $or: orConditions };
      } else {
        return res.status(200).json({
          message: "No orders found",
          data: [],
          totalPages: 0,
          totalOrders: 0,
          currentPage: page,
        });
      }
    }

    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit);

    const getOrder = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "firstname lastname email -_id")
      .select("-address -products -__v -isActive");

    if (!getOrder) {
      return res.status(400).json({ message: "No order found" });
    }

    return res.status(200).json({
      message: "Order fetch succesfully",
      data: getOrder,
      totalPages,
      totalOrders,
      currentPage: page,
    });
  } catch (err) {
    return res.status(500).json({
      message: "server error while fetching order",
      error: err.message,
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, newStatus } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: newStatus },
      { new: true, runValidators: true },
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

exports.getOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
    .select("-isActive -updatedAt -__v")
      .populate({
        path: "products.product",
        select : "-isActive -__v -createdAt -updatedAt",
        populate: {
          path: "category",
          select: "name slug -_id",
        },
      })
      .populate("createdBy", "firstname lastname email address")
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({
      message: "Order detail fetched successfully",
      data: order,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error while fetching order details",
      error: err.message,
    });
  }
};

const mongoose = require("mongoose");
const User = require("../model/User.model");
const Cart = require("../model/Cart.model");
const Order = require("../model/Orders.model");

exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressType, paymentMode } = req.body;

    const findUser = await User.findById(userId);

    if (!findUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const selectedAddress = findUser.address?.[addressType];
    if (
      !selectedAddress ||
      !selectedAddress.street ||
      !selectedAddress.zipcode
    ) {
      return res.status(404).json({
        message: `Your ${addressType} address is incomplete. Please update it in your profile.`,
      });
    }

    const orderAddress = {
      addressType: addressType,
      fullAddress: selectedAddress.street,
      city: selectedAddress.city,
      state: selectedAddress.state,
      zipcode: selectedAddress.zipcode,
      country: selectedAddress.country || "India",
    };
    const getCart = await Cart.findOne({ createdBy: userId }).populate(
      "products.product",
    );

    const orderProducts = [];
    let totalAmount = 0;

    for (const item of getCart.products) {
      if (!item.product) {
        continue;
      }

      const price = item.product.price;
      totalAmount += price * item.quantity;

      orderProducts.push({
        product: item.product._id,
        quantity: item.quantity,
        price: price,
      });
    }

    if (orderProducts.length === 0) {
      return res
        .status(400)
        .json({ message: "Cart contains invalid products" });
    }
    const newOrder = new Order({
      createdBy: userId,
      products: orderProducts,
      totalAmount,
      address: orderAddress,
      paymentMode: paymentMode,
    });

    await newOrder.save();

    getCart.products = [];
    await getCart.save();

    return res
      .status(200)
      .json({ message: "Order place succesfully", order: newOrder });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "server error while place order", error: err.message });
  }
};

exports.orderHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(404).json({ message: "User not found" });
    }

    const previousOrders = await Order.find({ createdBy: userId })
      .sort({
        createdAt: -1,
      })
      .populate("products.product");

    if (!previousOrders || previousOrders.length === 0) {
      return res
        .status(404)
        .json({ message: "User is not order anything yet" });
    }
    return res
      .status(200)
      .json({ message: "Order fetch succesfully", data: previousOrders });
  } catch (err) {
    return res.status(500).json({
      message: "server error while fetching previous orders",
      error: err.message,
    });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { orderId, newStatus } = req.body;
    const userId = req.user.id;

    const findOrder = await Order.findOneAndUpdate(
      { _id: orderId, createdBy: userId },
      { status: newStatus },
      { new: true, runValidators: true },
    );

    if (!findOrder) {
      return res.status(400).json({ message: "Order not found, or you don't have authorization to modify it." });
    }

    return res.status(200).json({
      success: true,
      message: "Order successfully cancelled.",
      data: findOrder,
    });
  } catch (err) {
    return res
      .status(500)
      .json({
        message: "Server error while updating order status.",
        error: err.message,
      });
  }
};

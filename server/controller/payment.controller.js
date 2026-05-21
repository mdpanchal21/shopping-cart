const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../model/Orders.model");
const Cart = require("../model/Cart.model");
const User = require("../model/User.model");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "placeholder_key",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret"
});

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressType } = req.body;

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

    const getCart = await Cart.findOne({ createdBy: userId }).populate("products.product");

    let totalAmount = 0;
    const orderProducts = [];
    
    for (const item of getCart.products) {
      if (!item.product) continue;
      
      const price = item.product.price;
      totalAmount += price * item.quantity;
      
      orderProducts.push({
        product: item.product._id,
        quantity: item.quantity,
        price: price,
      });
    }

    if (totalAmount === 0 || orderProducts.length === 0) {
      return res.status(400).json({ message: "Cart contains invalid products" });
    }

    const options = {
      amount: Math.round(totalAmount * 100), 
      currency: "INR",
      receipt: `receipt_order_${new Date().getTime()}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({ message: "Some error occurred with Razorpay" });
    }
    
    // Create the Order in MongoDB initially as "pending"
    const newOrder = new Order({
      createdBy: userId,
      products: orderProducts,
      totalAmount,
      address: {
        addressType: addressType,
        fullAddress: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        zipcode: selectedAddress.zipcode,
        country: selectedAddress.country || "India",
      },
      paymentMode: "Razorpay",
      razorpayOrderId: order.id,
      status: "pending" // Will be updated to confirmed via Webhook
    });

    await newOrder.save();

    res.status(200).json({
      success: true,
      message: "Razorpay order created & DB record initialized.",
      razorpayOrder: order,
    });
  } catch (err) {
    console.error("Razorpay Create Order Error:", err);
    res.status(500).json({ message: "Server error while creating order", error: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature using the Standard Secret (Not Webhook Secret)
    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "placeholder_secret");
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest("hex");

    if (digest !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid Signature, possible unauthorized request" });
    }

    // Since signature is legit, update the order status
    const updatedOrder = await Order.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { 
        status: "confirmed", 
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature
      },
      { new: true }
    );

    // Empty the user's shopping cart permanently
    if (updatedOrder) {
        const getCart = await Cart.findOne({ createdBy: updatedOrder.createdBy });
        if (getCart) {
          getCart.products = [];
          await getCart.save();
        }
    }

    return res.status(200).json({ success: true, message: "Payment validated." });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

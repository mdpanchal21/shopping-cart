const Product = require("../model/Product.model");
const Cart = require("../model/Cart.model");

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const { productId } = req.params;
    const { quantity } = req.body || {};

    const qtyToAdd = Number(quantity) || 1;

    const productExists = await Product.findById(productId);

    if (!productExists) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cartItem = await Cart.findOne({ createdBy: userId });

    if (!cartItem) {
      cartItem = new Cart({
        createdBy: userId,
        products: [{ product: productId, quantity: qtyToAdd }],
      });
    } else {
      const itemIndex = cartItem.products.findIndex(
        (p) => p.product.toString() === productId,
      );

      if (itemIndex > -1) {
        cartItem.products[itemIndex].quantity += qtyToAdd;
      } else {
        cartItem.products.push({
          product: productId,
          quantity: qtyToAdd,
        });
      }
    }

    await cartItem.save();
    return res
      .status(200)
      .json({ message: "Cart updated succesfully", cartItem });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "server error while add to cart" + err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const cart = await Cart.findOne({ createdBy: userId });

    if (!cart) {
      return res.status(404).json({ message: "cart not found" });
    }

    const itemIndex = cart.products.findIndex(
      (p) => p.product.toString() === productId,
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "product not in cart" });
    }

    if (cart.products[itemIndex].quantity > 1) {
      cart.products[itemIndex].quantity -= 1;
    } else {
      cart.products.splice(itemIndex, 1);
    }

    await cart.save();

    return res
      .status(200)
      .json({ message: "Product removed successfully", cart, success: true });
  } catch (err) {
    return res.status(500).json({
      message: "server error while remove product",
      error: err.message,
    });
  }
};

exports.getCartProduct = async (req, res) => {
  try {
    const userId = req.user.id;

    const findCart = await Cart.findOne({ createdBy: userId })
      .populate({
        path: "products.product",
        select: " -isActive -__v -createdAt -updatedAt",
        populate: {
          path: "category",
          select: "name -_id",
        },
      })
      .select("-__v -_id -createdBy -createdAt -updatedAt")
      .select("-products._id");

    if (!findCart) {
      return res.status(200).json({ message: "No product found in cart" });
    }

    return res.status(200).json({
      success: true,
      message: "Product fetch succesfully",
      data: findCart,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "server error while get cart", error: err.message });
  }
};

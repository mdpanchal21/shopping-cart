const User = require("../model/User.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Cart = require("../model/Cart.model");
const { generateAccessToken, generateRefreshToken } = require("../utils/token");

exports.registerUser = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "User registered successfully",
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "User with this email already exist",
      });
    }
    return res.status(500).json({
      message: "Internal server error while register user" + err.message,
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password, guestCart } = req.body;

    const userfind = await User.findOne({ email });

    if (!userfind) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, userfind.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (guestCart && guestCart.length > 0) {
      let cart = await Cart.findOne({ createdBy: userfind._id });
      if (!cart) cart = new Cart({ createdBy: userfind._id, products: [] });

      for (const item of guestCart) {
        const index = cart.products.findIndex(
          (p) => p.product.toString() === item.id,
        );
        if (index > -1) {
          cart.products[index].quantity += item.quantity;
        } else {
          cart.products.push({ product: item.id, quantity: item.quantity });
        }
      }
      await cart.save();
    }

    const accessToken = generateAccessToken(userfind);
    const refreshToken = generateRefreshToken(userfind);

    userfind.refreshToken = refreshToken;
    await userfind.save();

    const options = {
      httpOnly: true,
      secure: true,
    };

    res.cookie("refreshToken", refreshToken, options);
    res.cookie("accessToken", accessToken);

    return res
      .status(200)
      .json({ message: "Login succesfully", token: accessToken, role: userfind.role });
  } catch (err) {
    return res.status(500).json("Server Error while login user" + err);
  }
};

exports.logOut = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(201).json({ message: "User already logout" });
    }

    const userFind = await User.findOne({ refreshToken });

    if (userFind) {
      userFind.refreshToken = null;
      await userFind.save();
    }

    res.clearCookie("refreshToken", { httpOnly: true });
    res.clearCookie("accessToken");

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.generateAccessToken = async (req, res) => {
  try {
    console.log("ATTEMPTING TOKEN REFRESH");
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not provided" });
    }

    const decode = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const userFind = await User.findById(decode.id);

    if (!userFind || userFind.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const accessToken = jwt.sign(
      { id: userFind._id, role: userFind.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );
    
    console.log("NEW ACCESS TOKEN GENERATED FOR USER:", userFind.email);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return res
      .status(200)
      .json({ message: "new token create succesfully", accessToken });
  } catch (err) {
    if (req.cookies?.refreshToken) {
      try {
        await User.findOneAndUpdate(
          { refreshToken: req.cookies.refreshToken },
          { $set: { refreshToken: null } }
        );
      } catch (innerErr) {
        console.error("Failed to clear DB refresh token", innerErr);
      }
    }

    res.clearCookie("refreshToken", { httpOnly: true });
    res.clearCookie("accessToken");
    return res.status(403).json({
      message: "Session expired Please login",
    });
  }
};
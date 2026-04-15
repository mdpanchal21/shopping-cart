const User = require("../model/User.model");

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const findUser = await User.findById(userId).select("-password -role -isActive -__v -_id -refreshToken");

    if (!findUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "User profile fetch succesfully", data: findUser });
  } catch (err) {
    return res.status(500).json({
      message: "server error while get user profile",
      error: err.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const body = req.body || {};

    const allowedFields = [
      "firstname",
      "lastname",
      "address",
      "email",
      "avatar",
    ];

    const updates = {};

    if (req.file) {
      updates.avatar = req.file.path.replace(/\\/g, "/");
    }

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "address") {
          const add = body.address;
          for (const loc of ["home", "office"]) {
            if (add[loc]) {
              for (const key in add[loc]) {
                updates[`address.${loc}.${key}`] = add[loc][key];
              }
            }
          }
        } else if (field === "email") {
          const newEmail = body.email.toLowerCase();
          const existingUser = await User.findOne({ email: newEmail });
          if (existingUser && existingUser._id.toString() !== userId) {
            return res.status(409).json({ message: "Email already exists" });
          }
          updates.email = newEmail;
        } else if (field !== "avatar") {
          updates[field] = body[field];
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(404).json({
        message: "No valid fields provided for update",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "Profile updated succesfully", data: updatedUser });
  } catch (err) {
    return res.status(500).json({
      message: "server error while updating profile",
      error: err.message,
    });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.params;

    if (!["home", "office"].includes(type)) {
      return res.status(400).json({
        message: "Invalid address type",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $unset: { [`address.${type}`]: "" } },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: `${type} address deleted successfully`,
      data: {
        address: updatedUser.address, 
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error while deleting address",
      error: err.message,
    });
  }
};

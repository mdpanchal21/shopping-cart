const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    let token =
      req.headers.authorization?.split(" ")[1] || req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ message: "Access denied. Please login" });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decode;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
        code: "TOKEN_EXPIRED",
      });
    }
    return res.status(401).json({ message: "Not authorized", err });
  }
};

module.exports = authMiddleware;

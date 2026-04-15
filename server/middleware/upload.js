const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = "uploads/";

    if (file.fieldname === "avatar") {
      folder = "uploads/avatars/";
    } else if (file.fieldname === "productImage") {
      folder = "uploads/products/";
    }

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    cb(null, folder);
  },

  filename: function (req, file, cb) {
    if (!file) {
      return cb(new Error("No file uploaded"), false);
    }
    const uniqueName =
      new Date().toISOString().slice(0, 10) +
      "_" +
      file.originalname.toLowerCase();
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

module.exports = {
  uploadAvatar: upload.single("avatar"), 
  uploadProduct: upload.single("productImage"),
  uploadProductImages: upload.array("productImage", 5),
};

const mongoose = require("mongoose");
const Product = require("../model/Product.model");
const Category = require("../model/Category.model");


exports.getAllProducts = async (req, res) => {
  try {
    let { page, limit, category, search } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (category && category !== "All") {
      const foundCategory = await Category.findOne({
        slug: category.trim().toLowerCase(),
      });
      if (foundCategory) {
        query.category = foundCategory._id;
      } else {
        query.category = new mongoose.Types.ObjectId();
      }
    }

    const fetchProduct = await Product.find(query)
      .populate("category", "slug")
      .skip(skip)
      .limit(limit)
      .select("name price description image _id");

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json({
      message: "Product fetch succesfully",
      currentPage: page,
      totalPages,
      totalProducts,
      fetchProduct,
    });
  } catch (err) {
    return res.status(500).json({
      message: "server error while fetch user products",
      error: err.message,
    });
  }
};



const product = require("../model/Product.model");
const Category = require("../model/Category.model");

exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, category } = req.body;
    const createdBy = req.user.id;

    const validCategory = await Category.findById(category);

    if (!validCategory) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    let imagePath = [];

    if (req.files && req.files.length > 0) {
      imagePath = req.files.map((file) => `/uploads/products/${file.filename}`);
    } else if (req.file) {
      imagePath.push(`/uploads/products/${req.file.filename}`);
    }

    if (imagePath.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }
    const addProduct = await product.create({
      name,
      price,
      description,
      image: imagePath,
      category,
      createdBy,
    });

    return res
      .status(200)
      .json({ message: "Product create succesfully", addProduct });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error while add product" + err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    let { page, limit, category, search } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        return res.status(200).json({
          message: "No products found for this category",
          productList: [],
          totalProducts: 0,
          totalPages: 0,
          currentPage: page,
        });
      }
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const totalProducts = await product.countDocuments(query);
    const productList = await product
      .find(query)
      .populate("category", "name -_id")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .select("-createdBy -createdAt -updatedAt -__v");

    return res.status(200).json({
      message: "product fetch successfully",
      productList,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
    });
  } catch (err) {
    return res.status(500).json({
      message: "server error while fetching products: " + err.message,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { product_id } = req.params;

    const deletedProduct = await product.findByIdAndDelete(product_id);
    if (!deletedProduct) {
      return res.status(400).json({ message: "Product not found" });
    }

    return res
      .status(200)
      .json({ message: "Product deleted succesfully", deletedProduct });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "server error while deleting product" + err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    const updateData = {};
    // const { name, price, description, category } = req.body;
    const allowFields = ["name", "price", "description", "category"];

    allowFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    let finalImages = [];
    
    // 1. Handle Existing Images (the ones the user didn't delete and may have reordered)
    if (req.body.existingImages) {
      try {
        finalImages = JSON.parse(req.body.existingImages);
      } catch (e) {
        finalImages = [req.body.existingImages]; // Fallback if not stringified array
      }
    }

    // 2. Handle New Uploaded Images
    let newImagePaths = [];
    if (req.files && req.files.length > 0) {
      newImagePaths = req.files.map((file) => `/uploads/products/${file.filename}`);
    } else if (req.file) {
      newImagePaths = [`/uploads/products/${req.file.filename}`];
    }

    // Combine them (Existing first, then new)
    // Note: If the user reordered them on frontend, the `existingImages` array already has the new order.
    // However, if the user added "New" images and reordered THEM, we need to be careful.
    // In our current frontend setup, new images are always at the end of the imageGallery.
    if (newImagePaths.length > 0) {
      finalImages = [...finalImages, ...newImagePaths];
    }

    if (finalImages.length > 0) {
      updateData.image = finalImages;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No data provided to update" });
    }

    const updatedProduct = await product.findByIdAndUpdate(
      product_id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "server error while updating product" + err.message });
  }
};

exports.getSingleProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    const findProduct = await product
      .findById(product_id)
      .populate("category" , "-_id -__v -createdAt -updatedAt -slug -isActive")
      .populate("createdBy", "firstname lastname email role -_id")
      .select("-__v");

    if (!findProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
        success : true,
      message: "Product fetched successfully",
      data: findProduct
    });
  } catch (err) {
    return res.status(500).json({
        success : false,
      message: "server error while fetching single product: " + err.message,
    });
  }
};

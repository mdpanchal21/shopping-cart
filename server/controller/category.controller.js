const Category = require("../model/Category.model");

exports.createCategory = async (req, res) => {
  try {
    const { name, slug } = req.body;

    const addCategory = await Category.insertOne({ name, slug });

    return res.status(200).json({ message: "Category add succesfully" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "this slug is already exist" });
    } else {
      return res
        .status(500)
        .json({ message: "Server error while add category" });
    }
  }
};

exports.getCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (search) {
      query = {
        isActive: true,
        $or: [
          { name: { $regex: search, $options: "i" } },
          { slug: { $regex: search, $options: "i" } },
        ],
      };
    }

    const totalCategories = await Category.countDocuments(query);
    const totalPages = Math.ceil(totalCategories / limit);

    const Categories = await Category.find(
      query,
      { name: 1, _id: 1, slug: 1 },
    )
      .skip(skip)
      .limit(limit);

    if (Categories.length === 0) {
      return res.status(200).json({
        message: "No categories found",
        success: true,
        data: [],
        totalPages: 0,
        totalCategories: 0,
        currentPage: page,
      });
    }

    return res.status(200).json({
      message: "Categories fetched successfully",
      success: true,
      data: Categories,
      totalPages,
      totalCategories,
      currentPage: page,
    });
  } catch (err) {
    return res.status(500).json({
      message: "server error while fetch category",
      success: false,
      error: err.message,
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { categoryId, name, slug } = req.body;

    const updatedData = {};
    if (name) updatedData.name = name;
    if (slug) updatedData.slug = slug;

    const findCategory = await Category.findByIdAndUpdate(
      categoryId,
      { $set: updatedData },
      { new: true }
      ,
    ).select("-isActive -__v -createdAt -updatedAt -_id");

    if (!findCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({
      message: "Category updated successfully",
      data: findCategory,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "This slug already exists" });
    }
    return res.status(500).json({
      message: "Server error while updating category",
      error: err.message,
    });
  }
};

exports.deleteCategory = async (req,res) => {
  try{
    const { categoryId} = req.body;

    const findCategory = await Category.findByIdAndDelete(categoryId);

    if(!findCategory){
      return res.status(400).json({message : "Category not found"})
    }

    return res.status(200).json({message : "Category deleted succesfully"})
  }
  catch(err){
      return res.status(500).json({message : "Server error while delete category"  , error : err.message})
  }
}
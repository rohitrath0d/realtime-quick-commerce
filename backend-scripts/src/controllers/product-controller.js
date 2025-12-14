import { Product } from '../models/product.js'

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrl, isActive } = req.body;

    if (!name || price === undefined) {
      throw new Error("Name and price are required", 400);
    }

    const storeId = req.user.storeId; // Assuming store's user has storeId linked

    const product = await Product.create({
      name,
      description,
      price,
      imageUrl,
      isActive: isActive !== undefined ? isActive : true,
      store: storeId
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error in Create Product API",
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true });

    if (!products || products.length === 0) {
      throw new Error("No products available", 404);
    }

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in Product listing API",
    });
  }
}

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrl, isActive } = req.body;

    // Only STORE or ADMIN can update
    if (!["STORE", "ADMIN"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update products",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.imageUrl = imageUrl ?? product.imageUrl;
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error updating product",
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    // Only STORE or ADMIN can delete
    if (!["STORE", "ADMIN"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete products",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Soft delete
    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error deleting product",
    });
  }
};

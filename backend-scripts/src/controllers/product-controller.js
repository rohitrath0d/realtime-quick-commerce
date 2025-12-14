import { Product } from '../models/product.js'

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrl, isActive } = req.body;

    if (!name || price === undefined) {
      throw new AppError("Name and price are required", 400);
    }

    const product = await Product.create({
      name,
      description,
      price,
      imageUrl,
      isActive: isActive !== undefined ? isActive : true,
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
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error in Product listing API",
    });
  }
}
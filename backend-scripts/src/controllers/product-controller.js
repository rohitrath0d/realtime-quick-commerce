import mongoose from 'mongoose';
import { Product } from '../models/product.js'
import { Store } from '../models/store.js';

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrl, isActive } = req.body;

    if (!name || price === undefined) {
      throw new Error("Name and price are required", 400);
    }

    // const storeId = req.user.storeId; // Assuming store's user has storeId linked\
    const storeId = await Store.findOne({
      owner: new mongoose.Types.ObjectId(req.user.id)
    });
    console.log("req.user:", req.user);
    if (!storeId) {
      const error = new Error("Store ID is required");
      error.statusCode = 400;
      throw error;
    }
    console.log(storeId, "store id exists when creating product");


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
    let query = { isActive: true };

    // If STORE user, only show their store's products
    if (req.user && req.user.role === 'STORE') {
      const store = await Store.findOne({ owner: req.user.id });
      if (store) {
        query.store = store._id;
      }
    }
    const products = await Product.find({ isActive: true });

    // cant direcly throw 404 error, because if no product it will throw error on the frontend - indicating error in porduct listing api, and no fallback for it.
    // hence 200 code is happy case for them- to be able to not be reactive to error, and show no products available message on the frontend.
    // if (!products || products.length === 0) {
    //   throw new Error("No products available", 404);
    // }

    if (!products || products.length === 0) {
      // Return a message and indicate that the user can create products
      return res.status(200).json({
        success: true,
        message: "No products available. You can create a product.",
        data: [],
      });
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

    // // Only STORE or ADMIN can update
    // if (!["STORE", "ADMIN"].includes(req.user.role)) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "You are not authorized to update products",
    //   });
    // }

    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // For STORE users, verify they own this product's store
    if (req.user.role === 'STORE') {
      const store = await Store.findOne({ owner: req.user.id });
      if (!store || product.store.toString() !== store._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only update your own store's products",
        });
      }
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
    // // Only STORE or ADMIN can delete
    // if (!["STORE", "ADMIN"].includes(req.user.role)) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "You are not authorized to delete products",
    //   });
    // }

    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // For STORE users, verify they own this product's store
    if (req.user.role === 'STORE') {
      const store = await Store.findOne({ owner: req.user.id });
      if (!store || product.store.toString() !== store._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only delete your own store's products",
        });
      }
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

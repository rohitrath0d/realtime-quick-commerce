import { Store } from "../models/store.js"
import { Order } from "../models/order.js"
import { Product } from "../models/product.js";


export const placeOrder = catchAsync(async (req, res) => {
  try {
    const { items } = req.body;

    const store = await Store.findOne({ isActive: true });
    if (!store) throw new AppError("No active store available", 400);

    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        throw new AppError("Invalid or inactive product", 400);
      }

      total += product.price * item.quantity;
      orderItems.push({
        productId: product._id,
        name: product.name,
        qty: item.quantity,
        price: product.price,
      });
    }

    const order = await Order.create({
      customer: req.user.id,
      store: store._id,
      items: orderItems,
      total,
      status: "PLACED",
    });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error in Place order API",
    });
  }
}); 


export const getMyOrders = catchAsync(async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .sort({ createdAt: -1 })
      .populate("store", "name")
      .populate("assignedTo", "name");

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error in Get My Orders API",
    });
  }
});


export const getOrderById = catchAsync(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name email")
      .populate("store", "name")
      .populate("assignedTo", "name");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Access control
    const user = req.user;
    if (
      (user.role === "CUSTOMER" && order.customer._id.toString() !== user.id) ||
      (user.role === "STORE" && order.store._id.toString() !== user.storeId) ||
      (user.role === "DELIVERY" && order.assignedTo?._id.toString() !== user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error in Get Order by ID API",
    });
  }
});

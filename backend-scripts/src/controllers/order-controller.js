import { Store } from "../models/store.js"
import { Order } from "../models/order.js"
import { Product } from "../models/product.js";
import mongoose from 'mongoose';


export const placeOrder = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !items.length) return res.status(400).json({ error: 'No items provided' });

    const store = await Store.findOne({ isActive: true });
    if (!store) throw new Error("No active store available");

    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        throw new Error("Invalid or inactive product");
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

    // emit socket event to partners & admin
    const io = req.app.get('io');
    if (io) {
      io.emit('order_created', { orderId: order._id, status: order.status, total: order.total });
      io.emit('order_list_update', order); // helps partners/admin refresh lists
    }

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in Place order API",
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .sort({ createdAt: -1 })
      .populate("store", "name")
      // .populate("assignedTo", "name");
      .populate("deliveryPartner", "name");

    console.log(req.user);
    console.log(req.query);
    console.log("User ID:", req.user.id, typeof req.user.id);


    // Happy case: Orders are found, return them
    if (orders.length > 0) {
      return res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
      });
    }

    console.log('User ID:', req.user.id); // Checking if it's a valid ObjectId
    console.log('Orders found:', orders.length);

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
};


export const getOrderById = async (req, res) => {
  try {
    // Validate ID early to avoid casting errors and clearer responses
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid order id' });
    }

    const order = await Order.findById(req.params.id)
      .populate("customer", "name email")
      .populate("store", "name")
      // .populate("assignedTo", "name");
      .populate("deliveryPartner", "name");

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
      // (user.role === "DELIVERY" && order.assignedTo?._id.toString() !== user.id)
      (user.role === "DELIVERY" && order.deliveryPartner?._id.toString() !== user.id)
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
};

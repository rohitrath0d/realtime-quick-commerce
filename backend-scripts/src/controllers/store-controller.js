import { Store } from "../models/store.js";
import { Order } from "../models/order.js";
import { validateStatusTransition } from '../utils/orderWorkfllow.js';


// List orders for this store (PLACED → PACKED)
export const listStoreOrders = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) return res.status(404).json({ success: false, message: "Store not found" });

    const orders = await Order.find({
      store: store._id,
      status: { $in: ["PLACED", "STORE_ACCEPTED", "PACKING", "PACKED"] }
    })
      .sort({ createdAt: -1 })
      .populate("customer", "name email")
      .populate("deliveryPartner", "name");

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching store orders" });
  }
};

// Accept order: PLACED → STORE_ACCEPTED
export const acceptOrder = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) return res.status(404).json({ success: false, message: "Store not found" });

    const order = await Order.findOne({ _id: req.params.id, store: store._id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (order.status !== "PLACED")
      return res.status(400).json({ success: false, message: "Only PLACED orders can be accepted" });

    validateStatusTransition(order.status, "STORE_ACCEPTED", "STORE");
    order.status = "STORE_ACCEPTED";
    await order.save();

    // Emit socket event (optional)
    const io = req.app.get("io");
    if (io) io.emit("order_status_updated", order);

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error accepting order" });
  }
};

// Start packing: STORE_ACCEPTED → PACKING
export const startPacking = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) return res.status(404).json({ success: false, message: "Store not found" });

    const order = await Order.findOne({ _id: req.params.id, store: store._id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (order.status !== "STORE_ACCEPTED")
      return res.status(400).json({ success: false, message: "Order must be STORE_ACCEPTED first" });

    order.status = "PACKING";
    await order.save();

    const io = req.app.get("io");
    if (io) io.emit("order_status_updated", order);

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error starting packing" });
  }
};

// Mark packed: PACKING → PACKED
export const markPacked = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) return res.status(404).json({ success: false, message: "Store not found" });

    const order = await Order.findOne({ _id: req.params.id, store: store._id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (order.status !== "PACKING")
      return res.status(400).json({ success: false, message: "Order must be PACKING first" });

    order.status = "PACKED";    
    order.updatedBy = req.user.id;      // Helps trace who changed what.
    await order.save();

    const io = req.app.get("io");
    if (io) io.emit("order_status_updated", order);

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error marking order as packed" });
  }
};

// Create store (store owner, only 1 store per owner)
export const createStore = async (req, res) => {
  try {
    const existing = await Store.findOne({ owner: req.user.id });
    if (existing) return res.status(400).json({ success: false, message: "You already have a store" });

    const { name, address } = req.body;
    if (!name || !address) return res.status(400).json({ success: false, message: "Name and address required" });

    const store = await Store.create({ name, address, owner: req.user.id });
    res.status(201).json({ success: true, data: store });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error creating store" });
  }
};

// Delete store (store owner only)
export const deleteStore = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) return res.status(404).json({ success: false, message: "Store not found" });

    await store.deleteOne();
    res.status(200).json({ success: true, message: "Store deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error deleting store" });
  }
};

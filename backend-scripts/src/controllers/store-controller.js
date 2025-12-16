import { Store } from "../models/store.js";
import { Order } from "../models/order.js";
import { validateStatusTransition } from '../utils/orderWorkfllow.js';



// GET /api/store
// returns { exists: true, store: {...} } or { exists: false }
export const getStore = async (req, res) => {
  const store = await Store.findOne({ owner: req.user.id });
  if (!store) return res.status(200).json({ exists: false });
  return res.status(200).json({ exists: true, store });
};

// List orders for this store (PLACED → PACKED)
export const listStoreOrders = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    // if (!store) return res.status(404).json({ success: false, message: "Store not found" });
    if (!store) {
      return res.status(200).json({ success: true, message: "Store not found", storeExists: false, data: [] });
    }

    const orders = await Order.find({
      store: store._id,
      status: { $in: ["PLACED", "STORE_ACCEPTED", "PACKING", "PACKED"] }
    })
      .sort({ createdAt: -1 })
      .populate("customer", "name email")
      .populate("deliveryPartner", "name");

    res.status(200).json({
      success: true,
      storeExists: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching store orders" });
  }
};

// List ALL orders for this store (any status)
export const listAllStoreOrders = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) {
      return res.status(200).json({
        success: true,
        storeExists: false,
        data: [],
      });
    }

    const orders = await Order.find({ store: store._id })
      .sort({ createdAt: -1 })
      .populate("customer", "name email")
      .populate("deliveryPartner", "name");

    res.status(200).json({
      success: true,
      storeExists: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching all store orders" });
  }
};

export const getStoreStats = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) {
      return res.status(200).json({
        success: true,
        storeExists: false,
        data: {
          totalOrders: 0,
          placed: 0,
          processing: 0,
          packed: 0,
          delivered: 0,
          cancelled: 0,
          revenue: 0,
        },
      });
    }

    const byStatus = await Order.aggregate([
      { $match: { store: store._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const counts = byStatus.reduce((acc, row) => {
      acc[row._id] = row.count;
      return acc;
    }, {});

    const revenueAgg = await Order.aggregate([
      { $match: { store: store._id, status: "DELIVERED" } },
      { $group: { _id: null, revenue: { $sum: "$total" } } },
    ]);

    const revenue = revenueAgg?.[0]?.revenue || 0;

    res.status(200).json({
      success: true,
      storeExists: true,
      data: {
        totalOrders: Object.values(counts).reduce((s, n) => s + (n || 0), 0),
        placed: counts.PLACED || 0,
        processing: (counts.STORE_ACCEPTED || 0) + (counts.PACKING || 0),
        packed: counts.PACKED || 0,
        delivered: counts.DELIVERED || 0,
        cancelled: counts.CANCELLED || 0,
        revenue,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching store stats" });
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
    const statusCode = err?.statusCode || 500;
    res.status(statusCode).json({ success: false, message: err?.message || "Error accepting order" });
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

    validateStatusTransition(order.status, "PACKING", "STORE");
    order.status = "PACKING";
    await order.save();

    const io = req.app.get("io");
    if (io) io.emit("order_status_updated", order);

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    const statusCode = err?.statusCode || 500;
    res.status(statusCode).json({ success: false, message: err?.message || "Error starting packing" });
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

    validateStatusTransition(order.status, "PACKED", "STORE");
    order.status = "PACKED";
    order.updatedBy = req.user.id;      // Helps trace who changed what.
    await order.save();

    const io = req.app.get("io");
    if (io) io.emit("order_status_updated", order);

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    const statusCode = err?.statusCode || 500;
    res.status(statusCode).json({ success: false, message: err?.message || "Error marking order as packed" });
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

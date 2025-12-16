import mongoose from "mongoose";
import { Order } from "../models/order.js";
import { validateStatusTransition } from "../utils/orderWorkfllow.js";


// List unassigned orders
export const getUnassignedDeliveries = async (req, res) => {
  try {
    // const orders = await Order.find({ assignedTo: null, status: "PLACED" })
    // const orders = await Order.find({ deliveryPartner: null, status: "PLACED" })        // check if placed or packed

    // Let riders see all orders that are not yet assigned, regardless of status:
    // const orders = await Order.find({ 
    //   deliveryPartner: null, status: { $in: ["PLACED", "STORE_ACCEPTED", "PACKING", "PACKED"] } })      // $in allows them to see all orders in progress, not just PACKED.
    // Only show orders that are ready for pickup
    const orders = await Order.find({
      deliveryPartner: null,
      status: "PACKED",
    })
      .sort({ createdAt: 1 })
      .populate("store", "name")
      .populate("customer", "name");

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error in Get Unassigned Orders API",
    });
  }
};

export const getMyAssignedOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      // assignedTo: req.user.id,
      deliveryPartner: req.user.id,
      // status: { $ne: "DELIVERED" },
      // status: { $nin: ["DELIVERED", "CANCELLED"] },
    })
      // .sort({ createdAt: -1 })
      .sort({ updatedAt: -1 })
      .populate("customer", "name")
      .populate("store", "name");

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching assigned orders",
    });
  }
};


// Accept order
export const acceptOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const partnerId = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(orderId)) return res.status(400).json({ error: 'Invalid order id' });


    // Attempt to lock and assign the order atomically
    const updateOrder = await Order.findOneAndUpdate(
      // Don’t change the status here.
      // Accepting an order does not mean they can pick it up yet.
      {
        _id: orderId,
        // assignedTo: null,
        deliveryPartner: null,
        status: "PACKED",               // Delivery can only accept PACKED orders.   // only allow pickup if packed
      }, // only unassigned orders
      {
        // assignedTo: partnerId,
        deliveryPartner: partnerId,
        // status: "ACCEPTED",
        // status: "PICKED_UP",
        lockedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true } // return the updated document
    );

    if (!updateOrder) {
      throw new Error("Order is no longer available for delivery");
    }

    // Emit socket events to update customer and partner/admin lists
    const io = req.app.get('io');
    if (io) {
      const customerId = typeof updateOrder.customer === 'object' && updateOrder.customer?._id
        ? updateOrder.customer._id
        : updateOrder.customer;

      if (customerId) {
        io.to(`user_${customerId}`).emit('order_update', updateOrder);
      }

      // // notify customer room
      // io.to(`user_${updateOrder.customer._id}`).emit('order_update', updateOrder);

      // notify all partners/admins to refresh lists (or to specific rooms)
      io.emit('order_list_update', updateOrder);
      io.emit('order_accepted', updateOrder);
    }

    res.status(200).json({
      success: true,
      data: updateOrder,
    });
  } catch (err) {
    console.error(err);
    const statusCode = err?.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err?.message || "Error in Accept Order API",
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const { status } = req.body;

    // Validate ObjectId early
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order id' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Ensure the delivery partner is assigned to this order
    if (!order.deliveryPartner || order.deliveryPartner.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this order' });
    }

    // Enforce that the rider can only change status to PICKED_UP if the order is PACKED
    if (status === "PICKED_UP" && order.status !== "PACKED") {
      return res.status(400).json({ success: false, message: 'Order cannot be picked up until it is packed by the store' });
    }

    // Validate the status transition
    validateStatusTransition(order.status, status, req.user.role);

    order.status = status;
    order.updatedAt = new Date();
    order.updatedBy = req.user.id;
    await order.save();

    // Ensure response/socket payload has the fields the UI expects
    await order.populate('customer', 'name');
    await order.populate('store', 'name');

    // Emit socket events to notify customer and other partners/admins
    const io = req.app.get('io');
    if (io) {
      const customerId = typeof order.customer === 'object' && order.customer?._id
        ? order.customer._id
        : order.customer;

      if (customerId) {
        io.to(`user_${customerId}`).emit('order_update', order);
      }
      io.emit('order_list_update', order);
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    console.error(err);
    const statusCode = err?.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err?.message || "Error in Update Order Status API",
    });
  }
};

export const getDeliveryProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    const user = await User.findById(userId).select("name email role createdAt");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const stats = await Order.aggregate([
      {
        $match: {
          deliveryPartner: new mongoose.Types.ObjectId(userId),
          status: "DELIVERED",
        },
      },
      {
        $group: {
          _id: null,
          totalDeliveries: { $sum: 1 },
          totalEarnings: { $sum: "$total" },
        },
      },
    ]);

    const { totalDeliveries = 0, totalEarnings = 0 } = stats?.[0] || {};

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: null,
        totalDeliveries,
        rating: null,
        totalEarnings,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching delivery profile",
    });
  }
};

export const getDeliveryStats = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    const [availableCount, activeCount, deliveredAgg] = await Promise.all([
      Order.countDocuments({ deliveryPartner: null, status: "PACKED" }),
      Order.countDocuments({
        deliveryPartner: new mongoose.Types.ObjectId(userId),
        status: { $nin: ["DELIVERED", "CANCELLED"] },
      }),
      Order.aggregate([
        {
          $match: {
            deliveryPartner: new mongoose.Types.ObjectId(userId),
            status: "DELIVERED",
          },
        },
        {
          $group: {
            _id: null,
            completed: { $sum: 1 },
            totalEarnings: { $sum: "$total" },
          },
        },
      ]),
    ]);

    const { completed = 0, totalEarnings = 0 } = deliveredAgg?.[0] || {};

    res.status(200).json({
      success: true,
      data: {
        available: availableCount,
        active: activeCount,
        completed,
        totalEarnings,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching delivery stats",
    });
  }
};
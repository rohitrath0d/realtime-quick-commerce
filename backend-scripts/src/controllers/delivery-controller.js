import mongoose from "mongoose";
import { Order } from "../models/order.js";
import { validateStatusTransition } from "../utils/orderWorkflow.js";


// List unassigned orders
export const getUnassignedDeliveries = async (req, res) => {
  try {
    const orders = await Order.find({ assignedTo: null, status: "PLACED" })
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
      assignedTo: req.user.id,
      // status: { $ne: "DELIVERED" },
      status: { $nin: ["DELIVERED", "CANCELLED"] },
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
      {
        _id: orderId,
        assignedTo: null,
        status: "PACKED",               // Delivery can only accept PACKED orders.
      }, // only unassigned orders
      {
        assignedTo: partnerId,
        // status: "ACCEPTED",
        status: "PICKED_UP",
        lockedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true } // return the updated document
    );

    if (!updateOrder) {
      throw new Error("Order already assigned to another delivery partner..");
    }

    // Emit socket events to update customer and partner/admin lists
    const io = req.app.get('io');
    if (io) {
      // notify customer room
      io.to(`user_${updateOrder.customer._id}`).emit('order_update', updateOrder);
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
    res.status(500).json({
      success: false,
      message: "Error in Accept Order API",
    });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const partnerId = req.params.id;
    const userId = req.user.id;
    const { status } = req.body;

    const order = await Order.findById(partnerId);

    if (!order) throw new Error("Order not found");

    if (!order.assignedTo || order.assignedTo.toString() !== userId) {
      throw new Error("You are not assigned to this order");
    }

    // 
    validateStatusTransition(order.status, status, req.user.role);

    order.status = status;
    order.updatedAt = new Date();
    await order.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${order.customer._id}`).emit('order_update', order);
      io.emit('order_list_update', order); // admin / other partners
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error in Update Order Status API",
    });
  }
};

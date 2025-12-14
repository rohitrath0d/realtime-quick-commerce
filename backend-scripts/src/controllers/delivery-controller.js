import mongoose from "mongoose";
import { Order } from "../models/order.js";
import { validateStatusTransition } from "../utils/orderWorkflow.js";


// List unassigned orders
export const getUnassignedDeliveries = async (req, res) => {
  try {
    // const orders = await Order.find({ assignedTo: null, status: "PLACED" })
    // const orders = await Order.find({ deliveryPartner: null, status: "PLACED" })        // check if placed or packed

    // Let riders see all orders that are not yet assigned, regardless of status:
    const orders = await Order.find({ deliveryPartner: null, status: { $in: ["PLACED", "STORE_ACCEPTED", "PACKING", "PACKED"] } })      // $in allows them to see all orders in progress, not just PACKED.
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
      // Don’t change the status here.
      // Accepting an order does not mean they can pick it up yet.
      {
        _id: orderId,
        // assignedTo: null,
        deliveryPartner: null,
        // status: "PACKED",               // Delivery can only accept PACKED orders.   // only allow pickup if packed
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
    // const partnerId = req.params.id;   // this id is not a partner id
    const orderId = req.params.id;   // this id is not a partner id
    const userId = req.user.id;
    const { status } = req.body;

    const order = await Order.findById(orderId);

    if (!order) throw new Error("Order not found");

    // if (!order.assignedTo || order.assignedTo.toString() !== userId) {
    if (!order.deliveryPartner || order.deliveryPartner.toString() !== userId) {
      throw new Error("You are not assigned to this order");
    }

    // Enforce that the rider can only change status to PICKED_UP if the order is PACKED:
    // They can still view and accept PLACED orders.
    // They just can’t mark them as PICKED_UP prematurely.
    // Riders see all available orders.
    // They can claim any unassigned order.
    // They cannot pick up until the store has packed it.
    if (status === "PICKED_UP" && order.status !== "PACKED") {
      throw new Error("Order cannot be picked up until it is packed by the store");
    }

    // validation of workflow match
    validateStatusTransition(order.status, status, req.user.role);

    order.status = status;
    order.updatedAt = new Date();
    order.updatedBy = req.user.id;
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

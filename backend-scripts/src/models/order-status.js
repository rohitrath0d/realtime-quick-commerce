import mongoose from "mongoose";

const OrderStatusLogSchema = new mongoose.Schema({
  order: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Order", index: true 
  },
  status: String,
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  createdAt: { type: Date, default: Date.now },
});

export const OrderStatusLog = mongoose.model("OrderStatusLog", OrderStatusLogSchema);

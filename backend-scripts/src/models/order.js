import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        name: String,
        qty: Number,
        price: Number,
      },
    ],

    total: { type: Number, required: true },

    status: {
      type: String,
      enum: [
        "PLACED",
        "STORE_ACCEPTED",
        "PACKING",
        "PACKED",
        "PICKED_UP",
        "ON_THE_WAY",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PLACED",
      index: true,
    },

    // Locking mechanism (delivery partner)
    isLocked: { type: Boolean, default: false },
    lockedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Compound index for delivery matching
OrderSchema.index({ status: 1, isLocked: 1, createdAt: -1 });

export const Order = mongoose.model("Order", OrderSchema);

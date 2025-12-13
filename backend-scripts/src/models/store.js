import mongoose from "mongoose";

const StoreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
  },
  {
    timestamps: true
  }
);

export const Store = mongoose.model("Store", StoreSchema);

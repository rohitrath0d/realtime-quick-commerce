import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    description: String,
    price: { 
      type: Number, 
      required: true 
    },
    imageUrl: String,
    isActive: { 
      type: Boolean, 
      default: true 
    },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 1 });

export const Product = mongoose.model("Product", ProductSchema);

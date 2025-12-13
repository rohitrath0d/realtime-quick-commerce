import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["CUSTOMER", "DELIVERY", "ADMIN", "STORE"],
      required: true,
    },

    // Delivery partner specific
    isAvailable: { type: Boolean, default: true },
    currentOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model("User", UserSchema);


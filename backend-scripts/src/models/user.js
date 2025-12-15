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
// What this does:
// Runs before saving a user (pre("sa ve")).
// Checks if the password field is modified (important so it doesn’t rehash on updates where password isn’t changed).
// Generates a salt and hashes the password.
// Saves the hashed password in the database.
// This is the recommended way, because it keeps hashing logic centralized in the schema.
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  // next();
});

// What this does:
// Compares a plaintext password with the hashed password stored in DB.
// Works perfectly in your loginController:
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model("User", UserSchema);


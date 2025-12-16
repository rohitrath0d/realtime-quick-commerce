import mongoose from 'mongoose';
import { User } from '../../models/user.js';

async function seedDefaultUsers() {
  console.log("Starting to seed default users...");
  const defaultUsers = [
    {
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'Admin@123',
      role: 'ADMIN'
    },
    {
      name: 'Store Owner',
      email: 'store@test.com',
      password: 'Test@123',
      role: 'STORE'
    },
    // Create a default store for the store owner if not present
    {
      _seedStoreFor: 'store@test.com'
    },
    {
      name: 'Delivery Partner',
      email: 'delivery@test.com',
      password: 'Test@123',
      role: 'DELIVERY'
    },
    {
      name: 'Customer User',
      email: 'customer@test.com',
      password: 'Test@123',
      role: 'CUSTOMER'
    }
  ];

  for (const userData of defaultUsers) {
    try {
      if (userData._seedStoreFor) continue; // skip store seed entry

      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const newUser = await User.create(userData);
        console.log(`Created default user: ${userData.email} with ID: ${newUser._id}`);
      } else {
        existingUser.password = userData.password; // This will trigger hashing
        await existingUser.save();
        console.log(`Updated password for existing user: ${userData.email}`);
      }
    } catch (err) {
      console.error(`Error with user ${userData.email}:`, err.message);
    }
  }

  // Create a default store for the store owner user (if not present)
  try {
    const storeOwner = await User.findOne({ email: 'store@test.com' });
    if (storeOwner) {
      const { Store } = await import('../../models/store.js');
      const existingStore = await Store.findOne({ owner: storeOwner._id });
      if (!existingStore) {
        const newStore = await Store.create({ name: 'Demo Store', address: '123 Demo St', owner: storeOwner._id });
        console.log(`Created default store for ${storeOwner.email} with ID: ${newStore._id}`);
      } else {
        console.log(`Store for ${storeOwner.email} already exists`);
      }
    }
  } catch (err) {
    console.error('Error seeding default store:', err.message);
  }

  console.log("Finished seeding default users.");
}

export async function connectDB() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    throw new Error("MONGO_URI not provided");
  }

  console.log("Connecting to MongoDB:", MONGO_URI);

  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected");

    // Seed default users
    await seedDefaultUsers();

  } catch (err) {
    console.error("Mongo connection error:", err);
    process.exit(1);
  }
}

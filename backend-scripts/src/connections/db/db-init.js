import mongoose from 'mongoose';

export async function connectDB() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    throw new Error("MONGO_URI not provided");
  }

  console.log("Connecting to MongoDB:", MONGO_URI);

  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected");
    
  } catch (err) {
    console.error("Mongo connection error:", err);
    process.exit(1);
  }
}

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not set");
  }
  try {
    const connect = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${connect.connection.host}`);
    return connect;
  } catch (error) {
    console.log(`error connect from MongoDB : ${error.message}`);
    throw error;
  }
};

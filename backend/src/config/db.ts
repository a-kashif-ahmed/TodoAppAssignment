import mongoose from 'mongoose';

/**
 * Connects to MongoDB using the URI provided in the environment variables.
 * Exits the process if the connection fails, since the API cannot function
 * without a database connection.
 */
export const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    await mongoose.connect(uri);
    console.log(' MongoDB connected successfully');
  } catch (error) {
    console.error(' MongoDB connection error:', error);
    process.exit(1);
  }
};

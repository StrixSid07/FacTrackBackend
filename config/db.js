const mongoose = require("mongoose");
const debug = require("debug")("app:db");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // Timeout in case MongoDB server is not reachable
      socketTimeoutMS: 45000,
    });
    debug("MongoDB connection established successfully");
  } catch (error) {
    debug(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit the process with failure
  }

  mongoose.connection.on("connected", () => {
    debug("Mongoose connected to the database");
  });

  mongoose.connection.on("error", (err) => {
    debug(`Mongoose connection error: ${err.message}`);
  });

  mongoose.connection.on("disconnected", () => {
    debug("Mongoose connection is disconnected");
  });

  // Handle process termination
  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    debug("Mongoose connection closed due to app termination");
    process.exit(0);
  });
};

module.exports = connectDB;

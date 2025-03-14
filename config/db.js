const mongoose = require("mongoose");
const debug = require("debug")("app:db");

// Enable query sanitization to prevent NoSQL injection this cause error in get data 
// mongoose.set("sanitizeFilter", true);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
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

  // Graceful Shutdown Handling
  const shutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Closing MongoDB connection...`);
    await mongoose.connection.close();
    console.log("✅ MongoDB Connection Closed.");
    debug("Mongoose connection closed due to app termination");
    process.exit(0);
  };

  // Handle process termination and server shutdown
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

module.exports = connectDB;

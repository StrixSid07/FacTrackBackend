const chalk = require("chalk").default;
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const helmet = require("helmet");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/error-handler");
const notFound = require("./middleware/not-found");
const authMiddleware = require("./middleware/auth-middleware");

const authRoute = require("./routes/auth-route");
const workerRoutes = require("./routes/worker-route");
const machineRoutes = require("./routes/machine-route");
const workerrecordRoutes = require("./routes/work-record-route");
const refmachinesRoutes = require("./routes/ref-machine-route");
const checkapiRoutes = require("./routes/check-route");
const fixvalueapiRoutes = require("./routes/fix-value-route");
const threadBrandRoutes = require("./routes/thread-brand-route");
const threadChallanRoutes = require("./routes/thread-challan-routes");
const monthThreadCountRoutes = require("./routes/month-thread-count-routes");
const threadCuttingPriceRoute = require("./routes/thread-cutting-price-route");
const threadCuttingUserRoute = require("./routes/thread-cutting-user-route");
const threadCuttingDataListRoutes = require("./routes/thread-cutting-data-list-routes");
const monthThreadCuttingCountRoutes = require("./routes/month-thread-cutting-count-route");

dotenv.config();
const app = express();

// Connect to the database
connectDB();

// Cors policy
app.use(cors());
// app.use(
//   cors({
//     origin: "http://localhost:5174", // or '*' to allow all origins
//     methods: ["GET", "POST", "PUT", "DELETE"], // Add other methods if needed
//     credentials: true, // If you need to send cookies with the request
//   })
// );

// app.use(
//   cors({
//     origin: "https://factrack.netlify.app/", // or '*' to allow all origins
//     methods: ["GET", "POST", "PUT", "DELETE"], // Add other methods if needed
//     credentials: true, // If you need to send cookies with the request
//     allowedHeaders: ['Content-Type', 'Authorization'],
//   })
// );

// Middleware
// app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger); // Logs every request

// Routes
app.use("/api/auth", authRoute);
app.use("/api/workers", workerRoutes);
app.use("/api/machines", machineRoutes);
app.use("/api/work-records", workerrecordRoutes);
app.use("/api/ref-machines", refmachinesRoutes);
app.use("/api/check", checkapiRoutes);
app.use("/api/fix-value", fixvalueapiRoutes);
app.use("/api/thread-brands", threadBrandRoutes);
app.use("/api/thread-challans", threadChallanRoutes);
app.use("/api/month-thread-count", monthThreadCountRoutes);
app.use("/api/thread-cutting-price", threadCuttingPriceRoute);
app.use("/api/thread-cutting-user", threadCuttingUserRoute);
app.use("/api/thread-cutting-data-lists", threadCuttingDataListRoutes);
app.use("/api/month-thread-cutting-count", monthThreadCuttingCountRoutes);

// Protected admin-only route
app.get("/api/admin", authMiddleware, (req, res) => {
  res.json({ message: "Welcome, Admin! You have access to this route." });
});

// Handle unknown routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Server
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(
    chalk.green.bold(
      `✅ Server running on ${chalk.red.underline(`http://localhost:${PORT}`)}`
    )
  );
});

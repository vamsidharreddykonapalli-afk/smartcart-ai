const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const errorHandler = require("./middleware/errorHandler");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Socket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Export app, server, and io for use in other files
module.exports = { app, server, io };

// Routes
const authRoutes = require("./routes/authRoutes");

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://smartcart-ai-frontend.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

// Auth Routes
app.use("/api/auth", authRoutes);

// Cart Routes
const cartRoutes = require("./routes/cartRoutes");
app.use("/api/cart", cartRoutes);

// Product Routes
const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);

// Optimization Routes
const optimizationRoutes = require("./routes/optimizationRoutes");
app.use("/api/optimize", optimizationRoutes);

// Order Routes
const orderRoutes = require("./routes/orderRoutes");
app.use("/api/orders", orderRoutes);

// Analytics Routes
const analyticsRoutes = require("./routes/analyticsRoutes");
app.use("/api/analytics", analyticsRoutes);

// AI Routes
const aiRoutes = require("./routes/aiRoutes");
app.use("/api/ai", aiRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("SmartCart AI Backend Running");
});

// Error Handler
app.use(errorHandler);

// Connect MongoDB
const dbURI = process.env.MONGO_URI && process.env.MONGO_URI !== "your_mongodb_connection_string"
  ? process.env.MONGO_URI 
  : "mongodb://localhost:27017/smartcart-ai";

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(dbURI)
  .then(() => {
    console.log("MongoDB Connected");
    // Activate price update service
    require("./services/priceUpdater");
  })
  .catch(err => console.log(err));

  // Start server
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

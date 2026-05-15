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
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      process.env.CLIENT_URL,
    ].filter(Boolean);
    // Allow all vercel.app subdomains
    if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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

// Seed Route - responds immediately, processes in background to avoid timeout
let seedStatus = { running: false, done: false, result: null, error: null };

app.get("/api/seed", async (req, res) => {
  if (req.query.secret !== "smartcart-seed-2024") {
    return res.status(403).json({ message: "Forbidden" });
  }

  // Check status
  if (req.query.status === "1") {
    return res.json(seedStatus);
  }

  if (seedStatus.running) {
    return res.json({ message: "⏳ Seed already running, check /api/seed?secret=smartcart-seed-2024&status=1" });
  }

  // Respond immediately — process in background
  seedStatus = { running: true, done: false, result: null, error: null };
  res.json({ message: "⏳ Seed started in background! Check progress at /api/seed?secret=smartcart-seed-2024&status=1 in ~30 seconds." });

  // Run seed async (non-blocking)
  const seedFromCSV = require("./scripts/seedFromCSV");
  seedFromCSV()
    .then(result => {
      seedStatus = { running: false, done: true, result, error: null };
      console.log("✅ Seed complete:", result);
    })
    .catch(err => {
      seedStatus = { running: false, done: false, result: null, error: err.message };
      console.error("❌ Seed error:", err.message);
    });
});


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

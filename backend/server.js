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

// One-time Seed Route (protected by secret key)
app.get("/api/seed", async (req, res) => {
  if (req.query.secret !== "smartcart-seed-2024") {
    return res.status(403).json({ message: "Forbidden" });
  }
  try {
    const Product = require("./models/Product");
    const Price = require("./models/Price");
    const Order = require("./models/Order");
    const mongoose = require("mongoose");

    await Product.deleteMany({});
    await Price.deleteMany({});
    await Order.deleteMany({});

    const productsData = [
      { name: "Milk (1L)", category: "Dairy" },
      { name: "Butter (500g)", category: "Dairy" },
      { name: "Paneer (200g)", category: "Dairy" },
      { name: "Curd (1kg)", category: "Dairy" },
      { name: "Cheese Slices", category: "Dairy" },
      { name: "Basmati Rice (5kg)", category: "Staples" },
      { name: "Atta (10kg)", category: "Staples" },
      { name: "Toor Dal (1kg)", category: "Staples" },
      { name: "Moong Dal (1kg)", category: "Staples" },
      { name: "Sugar (1kg)", category: "Staples" },
      { name: "Salt (1kg)", category: "Staples" },
      { name: "Sunflower Oil (1L)", category: "Staples" },
      { name: "Ghee (500ml)", category: "Staples" },
      { name: "Onion (1kg)", category: "Produce" },
      { name: "Potato (1kg)", category: "Produce" },
      { name: "Tomato (1kg)", category: "Produce" },
      { name: "Banana (6 units)", category: "Produce" },
      { name: "Apple (1kg)", category: "Produce" },
      { name: "Spinach", category: "Produce" },
      { name: "Garlic (100g)", category: "Produce" },
      { name: "Ginger (100g)", category: "Produce" },
      { name: "Whole Wheat Bread", category: "Bakery" },
      { name: "Chocolate Cookies", category: "Snacks" },
      { name: "Potato Chips", category: "Snacks" },
      { name: "Mixed Nuts (200g)", category: "Snacks" },
      { name: "Peanut Butter", category: "Snacks" },
      { name: "Dark Chocolate", category: "Snacks" },
      { name: "Green Tea (25 bags)", category: "Beverages" },
      { name: "Instant Coffee (100g)", category: "Beverages" },
      { name: "Orange Juice (1L)", category: "Beverages" },
      { name: "Sparkling Water", category: "Beverages" },
      { name: "Dish Soap (500ml)", category: "Household" },
      { name: "Laundry Liquid (2L)", category: "Household" },
      { name: "Floor Cleaner", category: "Household" },
      { name: "Trash Bags", category: "Household" },
      { name: "Hand Wash (250ml)", category: "Bathroom" },
      { name: "Shampoo (400ml)", category: "Bathroom" },
      { name: "Toothpaste (150g)", category: "Bathroom" },
      { name: "Turmeric Powder (200g)", category: "Spices" },
      { name: "Chilli Powder (200g)", category: "Spices" },
      { name: "Cumin Seeds (100g)", category: "Spices" },
      { name: "Coriander Powder", category: "Spices" },
      { name: "Black Pepper", category: "Spices" },
      { name: "Eggs (12 pack)", category: "Dairy" },
      { name: "Amul Gold Milk (500ml)", category: "Dairy" },
      { name: "Maggi Noodles (12 pack)", category: "Snacks" },
      { name: "Bournvita (500g)", category: "Beverages" },
      { name: "Lays Chips (26g)", category: "Snacks" },
    ];

    const storeNames = ["BigBasket", "Zepto", "Blinkit", "Instamart", "JioMart", "Amazon Fresh"];
    const products = await Product.insertMany(productsData);

    const pricesData = [];
    products.forEach((product) => {
      const basePrice = Math.floor(Math.random() * (600 - 40) + 40);
      storeNames.forEach((store) => {
        const variation = (Math.random() * 0.3) - 0.15;
        pricesData.push({
          productId: product._id,
          store,
          price: Math.round(basePrice * (1 + variation))
        });
      });
    });
    await Price.insertMany(pricesData);

    const dummyUserId = new mongoose.Types.ObjectId();
    const ordersData = [];
    for (let i = 0; i < 8; i++) {
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - (8 - i) * 3);
      const orderItems = [];
      const numItems = Math.floor(Math.random() * 5) + 3;
      let totalCost = 0, savings = 0;
      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const price = Math.floor(Math.random() * 200) + 50;
        orderItems.push({ productName: product.name, quantity: Math.floor(Math.random() * 3) + 1, price, store: storeNames[Math.floor(Math.random() * storeNames.length)], category: product.category });
        totalCost += price;
        savings += Math.floor(price * 0.15);
      }
      ordersData.push({ userId: dummyUserId, items: orderItems, totalCost, savings, date: orderDate });
    }
    await Order.insertMany(ordersData);

    res.json({ success: true, message: `✅ Seeded ${products.length} products, ${pricesData.length} prices, ${ordersData.length} orders into MongoDB Atlas!` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
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

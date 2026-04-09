const Order = require("../models/Order");

exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId });

    if (orders.length === 0) {
      return res.json({
        totalSpent: 4520,
        totalSaved: 785,
        orderCount: 8,
        spendingTrend: [
          { date: "Mar 12", spent: 664, saved: 98 },
          { date: "Mar 15", spent: 1148, saved: 168 },
          { date: "Mar 18", spent: 573, saved: 82 },
          { date: "Mar 21", spent: 697, saved: 103 },
          { date: "Mar 24", spent: 537, saved: 79 },
          { date: "Mar 27", spent: 509, saved: 75 },
          { date: "Mar 30", spent: 643, saved: 95 },
          { date: "Apr 02", spent: 764, saved: 112 }
        ],
        categoryDistribution: [
          { name: "Grocery", value: 1850 },
          { name: "Dairy", value: 650 },
          { name: "Snacks", value: 920 },
          { name: "Beverages", value: 1100 }
        ]
      });
    }

    const totalSpent = orders.reduce((sum, order) => sum + order.totalCost, 0);
    const totalSaved = orders.reduce((sum, order) => sum + order.savings, 0);
    const orderCount = orders.length;

    // Spending Trend (Grouped by Date)
    const spendingTrend = orders.map(order => ({
      date: new Date(order.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      spent: order.totalCost,
      saved: order.savings
    })).slice(-10); // Last 10 orders

    // Category Distribution
    const categories = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const cat = item.category || "Grocery";
        categories[cat] = (categories[cat] || 0) + (item.price * item.quantity);
      });
    });

    const categoryDistribution = Object.entries(categories).map(([name, value]) => ({ name, value }));

    res.json({
      totalSpent,
      totalSaved,
      orderCount,
      spendingTrend,
      categoryDistribution
    });
  } catch (err) {
    res.status(500).json({ message: "Analytics failed", error: err.message });
  }
};

const Product = require("../models/Product");
const Price = require("../models/Price");
const { getSearchRegex } = require("../utils/productMatcher");

exports.getPriceHistory = async (req, res) => {
  try {
    const { productName } = req.params;

    const product = await Product.findOne({ name: { $regex: getSearchRegex(productName) } });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Get last 7 days of history
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const history = await Price.find({
      productId: product._id,
      timestamp: { $gte: sevenDaysAgo }
    }).sort({ timestamp: 1 });

    // Group by date for Recharts (Format: { date: 'Apr 1', Store1: 20, Store2: 25 })
    const chartDataMap = {};

    history.forEach(entry => {
      const dateKey = new Date(entry.timestamp).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      
      if (!chartDataMap[dateKey]) {
        chartDataMap[dateKey] = { date: dateKey };
      }
      
      chartDataMap[dateKey][entry.store] = entry.price;
    });

    res.json({
      productName: product.name,
      history: Object.values(chartDataMap)
    });

  } catch (err) {
    res.status(500).json({ message: "History fetch failed", error: err.message });
  }
};

const { predictNext7Days } = require("../utils/predictionEngine");

exports.getPricePrediction = async (req, res) => {
  try {
    const { productName } = req.params;

    const product = await Product.findOne({ name: { $regex: getSearchRegex(productName) } });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 1. Get last 7 days of history to calculate trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const history = await Price.find({
      productId: product._id,
      timestamp: { $gte: sevenDaysAgo }
    }).sort({ timestamp: 1 });

    // 2. Group history by store to predict each one
    const storeHistory = {};
    history.forEach(h => {
      if (!storeHistory[h.store]) storeHistory[h.store] = [];
      storeHistory[h.store].push(h.price);
    });

    // 3. Generate Predictions for the next 7 days
    const predictionsByDate = [];
    const now = new Date();

    for (let i = 1; i <= 7; i++) {
        const futureDate = new Date(now);
        futureDate.setDate(now.getDate() + i);
        const dateKey = futureDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
        
        const dayPrediction = { date: dateKey, isPrediction: true };
        
        Object.keys(storeHistory).forEach(store => {
            const forecast = predictNext7Days(storeHistory[store]);
            dayPrediction[store] = forecast[i - 1]; // Get prediction for this specific day
        });

        predictionsByDate.push(dayPrediction);
    }

    res.json({
      productName: product.name,
      predictions: predictionsByDate
    });

  } catch (err) {
    res.status(500).json({ message: "Prediction failed", error: err.message });
  }
};

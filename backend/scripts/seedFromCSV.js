const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const Product = require("../models/Product");
const Price = require("../models/Price");
const Order = require("../models/Order");

const STORES = ["BigBasket", "Zepto", "Blinkit", "Instamart", "JioMart", "Amazon Fresh"];

// Price variation multipliers per store (relative to BigBasket base price)
const STORE_MULTIPLIERS = {
  "BigBasket":    1.00,
  "Zepto":        1.05,
  "Blinkit":      1.08,
  "Instamart":    1.03,
  "JioMart":      0.97,
  "Amazon Fresh": 1.02,
};

function generateStorePrices(basePrice) {
  return STORES.map(store => ({
    store,
    price: Math.round(basePrice * STORE_MULTIPLIERS[store] * (0.92 + Math.random() * 0.16))
  }));
}

const seedFromCSV = async () => {
  await Product.deleteMany({});
  await Price.deleteMany({});
  await Order.deleteMany({});

  const bbPath = path.join(__dirname, "..", "data", "bigbasket_products.csv");
  const wfpPath = path.join(__dirname, "..", "data", "grocery_prices.csv");

  const productsMap = new Map(); // name -> { name, category, brand, basePrice }
  const MAX_PRODUCTS = 1000;

  // --- Source 1: BigBasket products (real products with real prices) ---
  if (fs.existsSync(bbPath)) {
    await new Promise((resolve, reject) => {
      fs.createReadStream(bbPath)
        .pipe(csv())
        .on("data", (row) => {
          if (productsMap.size >= MAX_PRODUCTS) return;
          const name = (row.product || "").trim();
          const price = parseFloat(row.sale_price || row.market_price);
          if (!name || isNaN(price) || price <= 0) return;
          if (!productsMap.has(name)) {
            productsMap.set(name, {
              name,
              category: row.category || "General",
              brand: row.brand || "Generic",
              unit: "unit",
              basePrice: price
            });
          }
        })
        .on("end", resolve)
        .on("error", reject);
    });
  }

  // --- Source 2: WFP grocery_prices.csv (fills remaining slots) ---
  if (fs.existsSync(wfpPath) && productsMap.size < MAX_PRODUCTS) {
    await new Promise((resolve, reject) => {
      fs.createReadStream(wfpPath)
        .pipe(csv())
        .on("data", (row) => {
          if (productsMap.size >= MAX_PRODUCTS) return;
          const name = (row.product_name || "").trim();
          const price = parseFloat(row.price);
          if (!name || isNaN(price) || price <= 0) return;
          if (!productsMap.has(name)) {
            productsMap.set(name, {
              name,
              category: row.category || "Other",
              brand: row.brand || "Generic",
              unit: row.unit || "unit",
              basePrice: price
            });
          }
        })
        .on("end", resolve)
        .on("error", reject);
    });
  }

  // --- Insert Products ---
  const productDocs = Array.from(productsMap.values()).map(p => ({
    name: p.name,
    category: p.category,
    brand: p.brand,
    unit: p.unit
  }));
  const insertedProducts = await Product.insertMany(productDocs);

  // --- Insert Prices (all 6 stores per product) ---
  const pricesData = [];
  insertedProducts.forEach((product, i) => {
    const basePrice = Array.from(productsMap.values())[i].basePrice;
    generateStorePrices(basePrice).forEach(({ store, price }) => {
      pricesData.push({ productId: product._id, store, price });
    });
  });
  await Price.insertMany(pricesData);

  // --- Mock Orders for Analytics ---
  const dummyUserId = new mongoose.Types.ObjectId();
  const ordersData = [];
  for (let i = 0; i < 10; i++) {
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - (10 - i) * 2);
    const orderItems = [];
    let totalCost = 0, savings = 0;
    for (let j = 0; j < 5; j++) {
      const product = insertedProducts[Math.floor(Math.random() * insertedProducts.length)];
      const price = Math.floor(Math.random() * 300) + 50;
      orderItems.push({
        productName: product.name,
        quantity: 1,
        price,
        store: STORES[Math.floor(Math.random() * STORES.length)],
        category: product.category
      });
      totalCost += price;
      savings += Math.floor(price * 0.12);
    }
    ordersData.push({ userId: dummyUserId, items: orderItems, totalCost, savings, date: orderDate });
  }
  await Order.insertMany(ordersData);

  return {
    products: insertedProducts.length,
    prices: pricesData.length,
    orders: ordersData.length
  };
};

// Run directly
if (require.main === module) {
  const dotenv = require("dotenv");
  dotenv.config();
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/smartcart-ai";
  mongoose.connect(uri)
    .then(() => seedFromCSV())
    .then(r => { console.log("✅ Seeded:", r); process.exit(0); })
    .catch(err => { console.error("❌", err); process.exit(1); });
}

module.exports = seedFromCSV;

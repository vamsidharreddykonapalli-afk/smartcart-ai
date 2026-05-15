/**
 * SmartCart AI - Comprehensive Dataset Seeder
 * Uses all 4 Kaggle datasets:
 *   1. bigbasket_products.csv      → Real product catalog with BigBasket prices
 *   2. Grocery_Inventory_Dataset   → Extra grocery products with unit prices
 *   3. data/raw/archiven/2026.csv  → India mandi prices (Min/Max/Modal) for fresh produce
 *   4. grocery_prices.csv          → Multi-store price data (backup)
 * 
 * MongoDB usage: ~15-30MB (well within 512MB Atlas free tier)
 */

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const Product = require("../models/Product");
const Price = require("../models/Price");
const Order = require("../models/Order");

const STORES = ["BigBasket", "Zepto", "Blinkit", "Instamart", "JioMart", "Amazon Fresh"];
const MAX_PRODUCTS = 1200;

// Store pricing multipliers relative to base price
const MULTIPLIERS = {
  "BigBasket":    1.00,
  "Zepto":        1.06,
  "Blinkit":      1.09,
  "Instamart":    1.03,
  "JioMart":      0.96,
  "Amazon Fresh": 1.02,
};

function jitter(val, pct = 0.08) {
  return Math.round(val * (1 + (Math.random() * pct * 2 - pct)));
}

function generateStorePrices(basePrice) {
  return STORES.map(store => ({
    store,
    price: Math.max(1, jitter(basePrice * MULTIPLIERS[store]))
  }));
}

async function readCSV(filePath, onRow, limit = Infinity) {
  if (!fs.existsSync(filePath)) return;
  let count = 0;
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => { if (count < limit) { onRow(row); count++; } })
      .on("end", resolve)
      .on("error", reject);
  });
}

const seedFromCSV = async () => {
  console.log("🌱 Starting SmartCart comprehensive seed...");
  await Product.deleteMany({});
  await Price.deleteMany({});
  await Order.deleteMany({});
  console.log("✅ Cleared old data.");

  const DATA = path.join(__dirname, "..", "data");
  const productsMap = new Map(); // name (lowercase) → { name, category, brand, basePrice }

  // ─────────────────────────────────────────────────────────────
  // SOURCE 1: BigBasket Products (real retail products + prices)
  // ─────────────────────────────────────────────────────────────
  const bbPath = path.join(DATA, "bigbasket_products.csv");
  await readCSV(bbPath, (row) => {
    if (productsMap.size >= MAX_PRODUCTS) return;
    const name = (row.product || "").trim();
    const price = parseFloat(row.sale_price) || parseFloat(row.market_price);
    if (!name || !price || price <= 0 || price > 50000) return;
    const key = name.toLowerCase();
    if (!productsMap.has(key)) {
      productsMap.set(key, {
        name,
        category: (row.category || "General").trim(),
        brand: (row.brand || "Generic").trim(),
        basePrice: price,
        source: "bigbasket"
      });
    }
  });
  console.log(`📦 BigBasket: ${productsMap.size} products loaded`);

  // ─────────────────────────────────────────────────────────────
  // SOURCE 2: Grocery Inventory & Sales Dataset (archive 4)
  // ─────────────────────────────────────────────────────────────
  const invPath = path.join(DATA, "raw", "Grocery_Inventory_and_Sales_Dataset.csv");
  await readCSV(invPath, (row) => {
    if (productsMap.size >= MAX_PRODUCTS) return;
    const name = (row.Product_Name || "").trim();
    const priceStr = (row.Unit_Price || "").replace(/[$,\s]/g, "");
    const price = parseFloat(priceStr) * 83; // Convert USD → INR approx
    if (!name || !price || price <= 0) return;
    const key = name.toLowerCase();
    if (!productsMap.has(key)) {
      productsMap.set(key, {
        name,
        category: (row.Catagory || row.Category || "Grocery").trim(),
        brand: (row.Supplier_Name || "Generic").trim(),
        basePrice: Math.round(price),
        source: "inventory"
      });
    }
  });
  console.log(`📦 After Inventory dataset: ${productsMap.size} products`);

  // ─────────────────────────────────────────────────────────────
  // SOURCE 3: India Mandi Prices 2026 (archive 3 / wfp)
  // For fresh produce — use Modal_Price as base, Min/Max for store range
  // ─────────────────────────────────────────────────────────────
  const mandiPath = path.join(DATA, "raw", "archiven", "2026.csv");
  const mandiPriceMap = new Map(); // commodity → { min, max, modal } (per quintal → convert to per kg)

  await readCSV(mandiPath, (row) => {
    const commodity = (row.Commodity || "").trim();
    const modal = parseFloat(row.Modal_Price);
    const min = parseFloat(row.Min_Price);
    const max = parseFloat(row.Max_Price);
    if (!commodity || !modal || modal <= 0) return;

    // Mandi prices are per QUINTAL (100kg), convert to per KG retail
    const retailModal = Math.round((modal / 100) * 1.4); // +40% retail margin
    const retailMin   = Math.round((min   / 100) * 1.2);
    const retailMax   = Math.round((max   / 100) * 1.6);

    if (!mandiPriceMap.has(commodity)) {
      mandiPriceMap.set(commodity, { modal: retailModal, min: retailMin, max: retailMax });
    } else {
      // Average multiple entries for same commodity
      const existing = mandiPriceMap.get(commodity);
      mandiPriceMap.set(commodity, {
        modal: Math.round((existing.modal + retailModal) / 2),
        min:   Math.round((existing.min   + retailMin  ) / 2),
        max:   Math.round((existing.max   + retailMax  ) / 2),
      });
    }
  });

  // Add mandi fresh produce to product map
  for (const [commodity, prices] of mandiPriceMap.entries()) {
    if (productsMap.size >= MAX_PRODUCTS) break;
    const key = commodity.toLowerCase();
    if (!productsMap.has(key) && prices.modal > 0 && prices.modal < 2000) {
      productsMap.set(key, {
        name: commodity,
        category: "Fresh Produce",
        brand: "Farm Fresh",
        basePrice: prices.modal,
        mandiMin: prices.min,
        mandiMax: prices.max,
        source: "mandi"
      });
    }
  }
  console.log(`📦 After Mandi data: ${productsMap.size} products`);

  // ─────────────────────────────────────────────────────────────
  // INSERT PRODUCTS INTO MONGODB
  // ─────────────────────────────────────────────────────────────
  const productValues = Array.from(productsMap.values());
  const productDocs = productValues.map(p => ({
    name: p.name,
    category: p.category,
    brand: p.brand || "Generic",
    unit: "unit"
  }));

  const insertedProducts = await Product.insertMany(productDocs);
  console.log(`✅ Inserted ${insertedProducts.length} products into MongoDB`);

  // ─────────────────────────────────────────────────────────────
  // INSERT PRICES (6 stores per product)
  // ─────────────────────────────────────────────────────────────
  const pricesData = [];
  insertedProducts.forEach((product, i) => {
    const src = productValues[i];
    const base = src.basePrice;

    if (src.source === "mandi" && src.mandiMin && src.mandiMax) {
      // Use real mandi min/max to spread store prices authentically
      const range = src.mandiMax - src.mandiMin;
      STORES.forEach((store, idx) => {
        const price = Math.max(1, Math.round(
          src.mandiMin + (range * (idx / STORES.length)) + jitter(range * 0.1)
        ));
        pricesData.push({ productId: product._id, store, price });
      });
    } else {
      // Use multiplier-based pricing for branded products
      generateStorePrices(base).forEach(({ store, price }) => {
        pricesData.push({ productId: product._id, store, price });
      });
    }
  });

  await Price.insertMany(pricesData);
  console.log(`✅ Inserted ${pricesData.length} price records`);

  // ─────────────────────────────────────────────────────────────
  // MOCK ORDERS FOR ANALYTICS DASHBOARD
  // ─────────────────────────────────────────────────────────────
  const dummyUserId = new mongoose.Types.ObjectId();
  const ordersData = [];
  for (let i = 0; i < 12; i++) {
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - (12 - i) * 2);
    const orderItems = [];
    let totalCost = 0, savings = 0;
    const numItems = 3 + Math.floor(Math.random() * 5);
    for (let j = 0; j < numItems; j++) {
      const product = insertedProducts[Math.floor(Math.random() * Math.min(insertedProducts.length, 200))];
      const price = Math.floor(Math.random() * 250) + 30;
      orderItems.push({
        productName: product.name,
        quantity: 1 + Math.floor(Math.random() * 3),
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
  console.log(`✅ Inserted ${ordersData.length} mock orders`);

  const result = {
    products: insertedProducts.length,
    prices: pricesData.length,
    orders: ordersData.length,
    estimatedMongoMB: Math.round((insertedProducts.length * 0.2 + pricesData.length * 0.1) / 1024 * 10) / 10
  };
  console.log("🎉 Seed complete:", result);
  return result;
};

// Allow running directly: node scripts/seedFromCSV.js
if (require.main === module) {
  const dotenv = require("dotenv");
  dotenv.config();
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/smartcart-ai";
  mongoose.connect(uri)
    .then(() => seedFromCSV())
    .then(r => { console.log("✅ Done:", r); process.exit(0); })
    .catch(err => { console.error("❌ Error:", err.message); process.exit(1); });
}

module.exports = seedFromCSV;

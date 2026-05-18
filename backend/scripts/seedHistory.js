/**
 * seedHistory.js — SmartCart AI
 *
 * Seeds realistic 14-day price history into the Price collection.
 * Each store has its own pricing personality (discount, premium, stable)
 * so the forecast chart shows meaningful, differentiated lines.
 *
 * Usage:
 *   node backend/scripts/seedHistory.js
 */

const mongoose = require("mongoose");
const Product = require("../models/Product");
const Price = require("../models/Price");
require("dotenv").config({ path: "../.env" });

const STORES = ["BigBasket", "Zepto", "Blinkit", "Instamart", "JioMart", "Swiggy", "Amazon Fresh"];

/**
 * Per-store pricing personality:
 *   priceMultiplier — relative price level vs the product's own price
 *   dailyDrift      — average daily price change (visible over 30-day chart)
 *   volatility      — 5% noise added on top
 */
const STORE_PROFILE = {
  "BigBasket":    { priceMultiplier: 1.05, dailyDrift: -0.40, volatility: 0.05 },
  "Zepto":        { priceMultiplier: 1.10, dailyDrift:  0.55, volatility: 0.05 },
  "Blinkit":      { priceMultiplier: 1.08, dailyDrift:  0.45, volatility: 0.05 },
  "Instamart":    { priceMultiplier: 1.07, dailyDrift:  0.30, volatility: 0.05 },
  "JioMart":      { priceMultiplier: 1.00, dailyDrift: -0.60, volatility: 0.05 },
  "Swiggy":       { priceMultiplier: 1.09, dailyDrift:  0.40, volatility: 0.05 },
  "Amazon Fresh": { priceMultiplier: 1.04, dailyDrift: -0.25, volatility: 0.05 },
};

/** Simple seeded pseudo-random in [0, 1) so history is reproducible. */
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

async function seedHistory() {
  const dbURI = process.env.MONGO_URI || "mongodb://localhost:27017/smartcart-ai";

  try {
    await mongoose.connect(dbURI);
    console.log("✅ Connected to MongoDB for history seeding...");

    const products = await Product.find().lean();
    console.log(`📦 Found ${products.length} products. Seeding 30-day history per store (5% noise)...\n`);

    const now = new Date();
    let insertCount = 0;

    for (const product of products) {
      // Anchor the product's "real" price
      const productBase = product.price || 100;
      // Use a deterministic seed per product so reruns produce the same history
      const productSeed = product._id.toString()
        .split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);

      for (const store of STORES) {
        const profile = STORE_PROFILE[store];
        // Starting price for day -30 (beginning of the month window)
        let price = Math.round(productBase * profile.priceMultiplier);

        for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
          const date = new Date(now);
          date.setDate(now.getDate() - daysAgo);
          // Spread entries within the day (avoids all timestamps colliding to midnight)
          date.setHours(8 + Math.floor(seededRandom(productSeed + daysAgo * 7 + STORES.indexOf(store)) * 12));
          date.setMinutes(Math.floor(seededRandom(productSeed + daysAgo * 13) * 60));

          // Apply drift + volatility
          const noise = (seededRandom(productSeed + daysAgo * 17 + STORES.indexOf(store) * 31) - 0.5)
                        * 2 * profile.volatility * price;
          price = Math.max(10, Math.round((price + profile.dailyDrift + noise) * 100) / 100);

          await Price.create({
            productId: product._id,
            store,
            price,
            timestamp: date,
          });

          insertCount++;
        }
      }

      process.stdout.write(".");
    }

    console.log(`\n\n✅ Done! Inserted ${insertCount} price history records.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seedHistory();

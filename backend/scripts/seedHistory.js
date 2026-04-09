const mongoose = require("mongoose");
const Product = require("../models/Product");
const Price = require("../models/Price");
require("dotenv").config({ path: "../.env" });

const STORES = ["BigBasket", "Zepto", "Blinkit", "Instamart", "JioMart", "Swiggy", "Amazon Fresh"];

async function seedHistory() {
  const dbURI = process.env.MONGO_URI || "mongodb://localhost:27017/smartcart-ai";
  
  try {
    await mongoose.connect(dbURI);
    console.log("Connected to MongoDB for history seeding...");

    const products = await Product.find();
    console.log(`Found ${products.length} products. Seeding 7-day history...`);

    const now = new Date();

    for (let product of products) {
      for (let store of STORES) {
        // Base price for this product-store combo
        const basePrice = Math.floor(Math.random() * 200) + 50;

        for (let i = 7; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(now.getDate() - i);
          
          // Add some random time within that day
          date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

          // Fluctuated price
          const priceChange = Math.floor(Math.random() * 11) - 5; // -5 to +5
          const price = Math.max(10, basePrice + priceChange);

          await Price.create({
            productId: product._id,
            store: store,
            price: price,
            timestamp: date
          });
        }
      }
      process.stdout.write("."); // Progress indicator
    }

    console.log("\nHistory seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seedHistory();

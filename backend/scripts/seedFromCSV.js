/**
 * SmartCart AI - Seed using SIMPLE item names only
 * Sources:
 *   1. data/raw/archiven/2026.csv  → India mandi commodity names (Tomato, Onion, Rice, etc.)
 *   2. Grocery_Inventory_Dataset   → Simple grocery product names
 *   3. Hardcoded common items      → Milk, Curd, Butter, Eggs, Atta, Dal etc.
 * 
 * BigBasket is NOT used as product names (names are too long/descriptive)
 */

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const Product = require("../models/Product");
const Price = require("../models/Price");
const Order = require("../models/Order");

const STORES = ["BigBasket", "Zepto", "Blinkit", "Instamart", "JioMart", "Amazon Fresh"];

// Realistic price multipliers per store
const MULTIPLIERS = {
  "BigBasket":    1.00,
  "Zepto":        1.06,
  "Blinkit":      1.09,
  "Instamart":    1.03,
  "JioMart":      0.96,
  "Amazon Fresh": 1.02,
};

function jitter(val, pct = 0.06) {
  return Math.max(1, Math.round(val * (1 + (Math.random() * pct * 2 - pct))));
}

function storePrice(base) {
  return STORES.map(s => ({ store: s, price: jitter(base * MULTIPLIERS[s]) }));
}

async function readCSV(filePath, onRow) {
  if (!fs.existsSync(filePath)) { console.warn("Missing:", filePath); return; }
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath).pipe(csv())
      .on("data", onRow).on("end", resolve).on("error", reject);
  });
}

const seedFromCSV = async () => {
  console.log("🌱 Seeding SmartCart (simple item names only)...");
  await Product.deleteMany({});
  await Price.deleteMany({});
  await Order.deleteMany({});

  const DATA = path.join(__dirname, "..", "data");
  const productsMap = new Map(); // key: lowercase name → { name, category, basePrice, mandiMin, mandiMax }

  // ─────────────────────────────────────────────────────────────
  // HARDCODED COMMON ITEMS (guaranteed to be in DB with good prices)
  // ─────────────────────────────────────────────────────────────
  const COMMON = [
    // Dairy
    { name: "Milk",           category: "Dairy",    price: 60  },
    { name: "Curd",           category: "Dairy",    price: 45  },
    { name: "Butter",         category: "Dairy",    price: 55  },
    { name: "Paneer",         category: "Dairy",    price: 85  },
    { name: "Ghee",           category: "Dairy",    price: 580 },
    { name: "Eggs",           category: "Dairy",    price: 90  },
    { name: "Cheese",         category: "Dairy",    price: 120 },
    { name: "Buttermilk",     category: "Dairy",    price: 30  },
    // Staples
    { name: "Atta",           category: "Staples",  price: 280 },
    { name: "Maida",          category: "Staples",  price: 45  },
    { name: "Sooji",          category: "Staples",  price: 40  },
    { name: "Basmati Rice",   category: "Staples",  price: 220 },
    { name: "Poha",           category: "Staples",  price: 55  },
    { name: "Toor Dal",       category: "Staples",  price: 140 },
    { name: "Moong Dal",      category: "Staples",  price: 130 },
    { name: "Chana Dal",      category: "Staples",  price: 95  },
    { name: "Urad Dal",       category: "Staples",  price: 145 },
    { name: "Masoor Dal",     category: "Staples",  price: 110 },
    { name: "Salt",           category: "Staples",  price: 25  },
    { name: "Sugar",          category: "Staples",  price: 50  },
    { name: "Sunflower Oil",  category: "Staples",  price: 145 },
    { name: "Mustard Oil",    category: "Staples",  price: 175 },
    { name: "Coconut Oil",    category: "Staples",  price: 210 },
    { name: "Olive Oil",      category: "Staples",  price: 680 },
    // Produce
    { name: "Tomato",         category: "Produce",  price: 40  },
    { name: "Onion",          category: "Produce",  price: 35  },
    { name: "Potato",         category: "Produce",  price: 30  },
    { name: "Garlic",         category: "Produce",  price: 60  },
    { name: "Ginger",         category: "Produce",  price: 80  },
    { name: "Carrot",         category: "Produce",  price: 45  },
    { name: "Cabbage",        category: "Produce",  price: 30  },
    { name: "Capsicum",       category: "Produce",  price: 55  },
    { name: "Cauliflower",    category: "Produce",  price: 40  },
    { name: "Spinach",        category: "Produce",  price: 25  },
    { name: "Brinjal",        category: "Produce",  price: 35  },
    { name: "Peas",           category: "Produce",  price: 60  },
    { name: "Cucumber",       category: "Produce",  price: 30  },
    { name: "Green Chilli",   category: "Produce",  price: 50  },
    { name: "Coriander",      category: "Produce",  price: 20  },
    { name: "Mint",           category: "Produce",  price: 15  },
    // Fruits
    { name: "Banana",         category: "Fruits",   price: 50  },
    { name: "Apple",          category: "Fruits",   price: 180 },
    { name: "Mango",          category: "Fruits",   price: 120 },
    { name: "Orange",         category: "Fruits",   price: 80  },
    { name: "Grapes",         category: "Fruits",   price: 90  },
    { name: "Watermelon",     category: "Fruits",   price: 60  },
    { name: "Papaya",         category: "Fruits",   price: 45  },
    { name: "Pomegranate",    category: "Fruits",   price: 150 },
    { name: "Pineapple",      category: "Fruits",   price: 70  },
    { name: "Guava",          category: "Fruits",   price: 55  },
    // Bakery & Snacks
    { name: "Bread",          category: "Bakery",   price: 42  },
    { name: "Brown Bread",    category: "Bakery",   price: 55  },
    { name: "Biscuits",       category: "Snacks",   price: 30  },
    { name: "Chips",          category: "Snacks",   price: 20  },
    { name: "Namkeen",        category: "Snacks",   price: 65  },
    { name: "Maggi",          category: "Snacks",   price: 14  },
    { name: "Noodles",        category: "Snacks",   price: 30  },
    // Beverages
    { name: "Tea",            category: "Beverages",price: 280 },
    { name: "Coffee",         category: "Beverages",price: 350 },
    { name: "Juice",          category: "Beverages",price: 120 },
    { name: "Cold Drink",     category: "Beverages",price: 45  },
    { name: "Water",          category: "Beverages",price: 20  },
    // Spices
    { name: "Turmeric",       category: "Spices",   price: 65  },
    { name: "Chilli Powder",  category: "Spices",   price: 75  },
    { name: "Coriander Powder",category:"Spices",   price: 55  },
    { name: "Cumin",          category: "Spices",   price: 125 },
    { name: "Garam Masala",   category: "Spices",   price: 95  },
    { name: "Pepper",         category: "Spices",   price: 200 },
    { name: "Cardamom",       category: "Spices",   price: 350 },
    // Meat & Protein
    { name: "Chicken",        category: "Meat",     price: 280 },
    { name: "Mutton",         category: "Meat",     price: 750 },
    { name: "Fish",           category: "Meat",     price: 350 },
    // Household
    { name: "Shampoo",        category: "Personal Care", price: 185 },
    { name: "Soap",           category: "Personal Care", price: 42  },
    { name: "Toothpaste",     category: "Personal Care", price: 95  },
    { name: "Hand Wash",      category: "Personal Care", price: 115 },
    { name: "Detergent",      category: "Household",price: 250 },
    { name: "Dish Wash",      category: "Household",price: 65  },
    { name: "Floor Cleaner",  category: "Household",price: 120 },
  ];

  for (const item of COMMON) {
    productsMap.set(item.name.toLowerCase(), {
      name: item.name,
      category: item.category,
      basePrice: item.price,
      source: "hardcoded"
    });
  }
  console.log(`✅ Hardcoded: ${productsMap.size} common items`);

  // ─────────────────────────────────────────────────────────────
  // Mandi 2026.csv — simple commodity names (Mousambi, Bhindi, etc.)
  // ─────────────────────────────────────────────────────────────
  const mandiPath = path.join(DATA, "raw", "archiven", "2026.csv");
  const mandiMap = new Map(); // commodity → { min, max, modal }

  await readCSV(mandiPath, (row) => {
    const commodity = (row.Commodity || "").trim();
    const modal = parseFloat(row.Modal_Price);
    if (!commodity || !modal || modal <= 0) return;
    // Convert per-quintal → per-kg retail price (+40% margin)
    const retailPrice = Math.round((modal / 100) * 1.4);
    if (retailPrice < 1 || retailPrice > 5000) return;
    if (!mandiMap.has(commodity)) {
      mandiMap.set(commodity, {
        modal: retailPrice,
        min: Math.round((parseFloat(row.Min_Price || modal) / 100) * 1.2),
        max: Math.round((parseFloat(row.Max_Price || modal) / 100) * 1.6),
      });
    }
  });

  // Add mandi items not already in hardcoded list
  for (const [commodity, prices] of mandiMap.entries()) {
    const key = commodity.toLowerCase();
    if (!productsMap.has(key) && commodity.length <= 40) {
      productsMap.set(key, {
        name: commodity,
        category: "Fresh Produce",
        basePrice: prices.modal,
        mandiMin: prices.min,
        mandiMax: prices.max,
        source: "mandi"
      });
    }
  }
  console.log(`✅ After mandi: ${productsMap.size} items`);

  // ─────────────────────────────────────────────────────────────
  // Grocery Inventory CSV — short product names only (< 35 chars)
  // ─────────────────────────────────────────────────────────────
  const invPath = path.join(DATA, "raw", "Grocery_Inventory_and_Sales_Dataset.csv");
  await readCSV(invPath, (row) => {
    const name = (row.Product_Name || "").trim();
    if (!name || name.length > 35) return; // Skip long names
    const priceStr = (row.Unit_Price || "").replace(/[$,\s]/g, "");
    const price = Math.round(parseFloat(priceStr) * 83); // USD → INR
    if (!price || price <= 0 || price > 10000) return;
    const key = name.toLowerCase();
    if (!productsMap.has(key)) {
      productsMap.set(key, {
        name,
        category: (row.Catagory || "Grocery").trim(),
        basePrice: price,
        source: "inventory"
      });
    }
  });
  console.log(`✅ After inventory: ${productsMap.size} items`);

  // ─────────────────────────────────────────────────────────────
  // INSERT INTO MONGODB
  // ─────────────────────────────────────────────────────────────
  const productValues = Array.from(productsMap.values());
  const insertedProducts = await Product.insertMany(
    productValues.map(p => ({ name: p.name, category: p.category, brand: "Generic", unit: "unit" }))
  );
  console.log(`✅ Inserted ${insertedProducts.length} products`);

  const pricesData = [];
  insertedProducts.forEach((product, i) => {
    const src = productValues[i];
    if (src.source === "mandi" && src.mandiMin && src.mandiMax) {
      const range = src.mandiMax - src.mandiMin;
      STORES.forEach((store, idx) => {
        pricesData.push({ productId: product._id, store, price: Math.max(1, Math.round(src.mandiMin + (range * idx / STORES.length) + jitter(range * 0.05))) });
      });
    } else {
      storePrice(src.basePrice).forEach(({ store, price }) => {
        pricesData.push({ productId: product._id, store, price });
      });
    }
  });
  await Price.insertMany(pricesData);
  console.log(`✅ Inserted ${pricesData.length} prices`);

  // Mock orders
  const uid = new mongoose.Types.ObjectId();
  const orders = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(); d.setDate(d.getDate() - (12 - i) * 2);
    const items = []; let total = 0, savings = 0;
    for (let j = 0; j < 5; j++) {
      const p = insertedProducts[Math.floor(Math.random() * Math.min(80, insertedProducts.length))];
      const pr = Math.floor(Math.random() * 250) + 30;
      items.push({ productName: p.name, quantity: 1, price: pr, store: STORES[Math.floor(Math.random() * 6)], category: p.category });
      total += pr; savings += Math.floor(pr * 0.12);
    }
    orders.push({ userId: uid, items, totalCost: total, savings, date: d });
  }
  await Order.insertMany(orders);

  const result = { products: insertedProducts.length, prices: pricesData.length, orders: orders.length };
  console.log("🎉 Seed done:", result);
  return result;
};

if (require.main === module) {
  const dotenv = require("dotenv");
  dotenv.config();
  mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/smartcart-ai")
    .then(() => seedFromCSV())
    .then(r => { console.log("✅", r); process.exit(0); })
    .catch(err => { console.error("❌", err.message); process.exit(1); });
}

module.exports = seedFromCSV;

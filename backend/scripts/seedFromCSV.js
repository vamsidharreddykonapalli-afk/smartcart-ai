const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const Product = require("../models/Product");
const Price = require("../models/Price");
const Order = require("../models/Order");

const seedFromCSV = async (mongoURI) => {
  await Product.deleteMany({});
  await Price.deleteMany({});
  await Order.deleteMany({});

  const dataPath = path.join(__dirname, "..", "data", "grocery_prices.csv");
  const productsMap = new Map();
  const rawPrices = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(dataPath)
      .pipe(csv())
      .on("data", (row) => {
        if (productsMap.size >= 500) return;
        const name = row.product_name;
        if (!name) return;
        if (!productsMap.has(name)) {
          productsMap.set(name, {
            name,
            category: row.category || "Other",
            brand: row.brand || "Generic",
            unit: row.unit || "pc"
          });
        }
        if (row.store && row.price && !isNaN(parseFloat(row.price))) {
          rawPrices.push({ productName: name, store: row.store, price: parseFloat(row.price) });
        }
      })
      .on("end", resolve)
      .on("error", reject);
  });

  const insertedProducts = await Product.insertMany(Array.from(productsMap.values()));
  const nameToId = {};
  insertedProducts.forEach(p => { nameToId[p.name] = p._id; });

  const pricesData = rawPrices
    .filter(p => nameToId[p.productName])
    .map(p => ({ productId: nameToId[p.productName], store: p.store, price: p.price }));
  await Price.insertMany(pricesData);

  // Mock orders for analytics
  const dummyUserId = new mongoose.Types.ObjectId();
  const storeNames = ["BigBasket", "Zepto", "Blinkit", "Instamart", "JioMart", "Amazon Fresh"];
  const ordersData = [];
  for (let i = 0; i < 8; i++) {
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - (8 - i) * 3);
    const orderItems = [];
    let totalCost = 0, savings = 0;
    for (let j = 0; j < 4; j++) {
      const product = insertedProducts[Math.floor(Math.random() * insertedProducts.length)];
      const price = Math.floor(Math.random() * 200) + 50;
      orderItems.push({
        productName: product.name,
        quantity: 1,
        price,
        store: storeNames[Math.floor(Math.random() * storeNames.length)],
        category: product.category
      });
      totalCost += price;
      savings += Math.floor(price * 0.15);
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

// Allow running directly: node scripts/seedFromCSV.js
if (require.main === module) {
  const dotenv = require("dotenv");
  dotenv.config();
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/smartcart-ai";
  mongoose.connect(uri)
    .then(() => seedFromCSV(uri))
    .then(result => { console.log("Seeded:", result); process.exit(0); })
    .catch(err => { console.error(err); process.exit(1); });
}

module.exports = seedFromCSV;

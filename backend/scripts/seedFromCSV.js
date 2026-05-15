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

  // --- Add common Indian grocery items NOT in the CSV ---
  const storeNames = ["BigBasket", "Zepto", "Blinkit", "Instamart", "JioMart", "Amazon Fresh"];
  const commonGroceries = [
    { name: "Milk", category: "Dairy", prices: [62, 60, 64, 61, 58, 65] },
    { name: "Curd", category: "Dairy", prices: [45, 42, 48, 44, 40, 50] },
    { name: "Butter", category: "Dairy", prices: [55, 52, 57, 54, 50, 59] },
    { name: "Paneer", category: "Dairy", prices: [85, 80, 90, 83, 78, 92] },
    { name: "Ghee", category: "Dairy", prices: [580, 560, 600, 575, 550, 610] },
    { name: "Eggs", category: "Dairy", prices: [90, 85, 95, 88, 82, 98] },
    { name: "Cheese", category: "Dairy", prices: [120, 115, 125, 118, 110, 130] },
    { name: "Atta", category: "Staples", prices: [280, 265, 290, 275, 260, 295] },
    { name: "Maida", category: "Staples", prices: [45, 42, 48, 44, 40, 50] },
    { name: "Basmati Rice", category: "Staples", prices: [220, 210, 230, 218, 205, 235] },
    { name: "Toor Dal", category: "Staples", prices: [140, 135, 145, 138, 130, 150] },
    { name: "Moong Dal", category: "Staples", prices: [130, 125, 135, 128, 122, 140] },
    { name: "Chana Dal", category: "Staples", prices: [95, 90, 100, 93, 88, 105] },
    { name: "Urad Dal", category: "Staples", prices: [145, 140, 150, 143, 136, 155] },
    { name: "Salt", category: "Staples", prices: [25, 22, 28, 24, 20, 30] },
    { name: "Sugar", category: "Staples", prices: [50, 48, 52, 49, 46, 54] },
    { name: "Sunflower Oil", category: "Staples", prices: [145, 138, 152, 142, 135, 155] },
    { name: "Mustard Oil", category: "Staples", prices: [175, 168, 182, 172, 165, 185] },
    { name: "Olive Oil", category: "Staples", prices: [680, 650, 710, 675, 640, 720] },
    { name: "Bread", category: "Bakery", prices: [42, 40, 45, 41, 38, 48] },
    { name: "Brown Bread", category: "Bakery", prices: [55, 52, 58, 54, 50, 60] },
    { name: "Maggi Noodles", category: "Snacks", prices: [14, 13, 15, 14, 12, 16] },
    { name: "Biscuits", category: "Snacks", prices: [30, 28, 32, 29, 26, 34] },
    { name: "Potato Chips", category: "Snacks", prices: [20, 18, 22, 19, 17, 24] },
    { name: "Namkeen", category: "Snacks", prices: [65, 60, 70, 63, 58, 72] },
    { name: "Tea", category: "Beverages", prices: [280, 265, 295, 275, 260, 300] },
    { name: "Coffee", category: "Beverages", prices: [350, 335, 365, 345, 330, 370] },
    { name: "Cold Drink", category: "Beverages", prices: [45, 42, 48, 44, 40, 50] },
    { name: "Juice", category: "Beverages", prices: [120, 115, 125, 118, 110, 130] },
    { name: "Water Bottle", category: "Beverages", prices: [20, 18, 22, 19, 17, 24] },
    { name: "Shampoo", category: "Personal Care", prices: [185, 175, 195, 182, 170, 200] },
    { name: "Soap", category: "Personal Care", prices: [42, 40, 45, 41, 38, 48] },
    { name: "Toothpaste", category: "Personal Care", prices: [95, 90, 100, 93, 88, 105] },
    { name: "Hand Wash", category: "Personal Care", prices: [115, 110, 120, 113, 108, 125] },
    { name: "Detergent", category: "Household", prices: [250, 240, 260, 248, 235, 265] },
    { name: "Dish Wash", category: "Household", prices: [65, 62, 68, 64, 60, 70] },
    { name: "Turmeric Powder", category: "Spices", prices: [65, 60, 70, 63, 58, 72] },
    { name: "Red Chilli Powder", category: "Spices", prices: [75, 70, 80, 73, 68, 82] },
    { name: "Coriander Powder", category: "Spices", prices: [55, 52, 58, 54, 50, 60] },
    { name: "Garam Masala", category: "Spices", prices: [95, 90, 100, 93, 88, 105] },
    { name: "Cumin Seeds", category: "Spices", prices: [125, 120, 130, 123, 118, 135] },
    { name: "Chicken", category: "Meat", prices: [280, 265, 295, 275, 260, 300] },
    { name: "Mutton", category: "Meat", prices: [750, 720, 780, 745, 710, 790] },
    { name: "Banana", category: "Fruits", prices: [50, 48, 52, 49, 46, 54] },
    { name: "Apple", category: "Fruits", prices: [180, 170, 190, 177, 165, 195] },
    { name: "Mango", category: "Fruits", prices: [120, 115, 125, 118, 110, 130] },
  ];

  const extraProducts = [];
  const extraPrices = [];
  for (const item of commonGroceries) {
    const p = { name: item.name, category: item.category, brand: "Generic", unit: "unit" };
    extraProducts.push(p);
  }
  const insertedExtra = await Product.insertMany(extraProducts);
  for (let i = 0; i < insertedExtra.length; i++) {
    const item = commonGroceries[i];
    storeNames.forEach((store, idx) => {
      extraPrices.push({ productId: insertedExtra[i]._id, store, price: item.prices[idx] });
    });
  }
  await Price.insertMany(extraPrices);

  // Mock orders for analytics
  const dummyUserId = new mongoose.Types.ObjectId();
  const allInserted = [...insertedProducts, ...insertedExtra];
  const ordersData = [];
  for (let i = 0; i < 8; i++) {
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - (8 - i) * 3);
    const orderItems = [];
    let totalCost = 0, savings = 0;
    for (let j = 0; j < 4; j++) {
      const product = allInserted[Math.floor(Math.random() * allInserted.length)];
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
    products: insertedProducts.length + insertedExtra.length,
    prices: pricesData.length + extraPrices.length,
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

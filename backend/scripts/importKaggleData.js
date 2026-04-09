const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const Product = require("../models/Product");
const Price = require("../models/Price");

dotenv.config();

const dataPath = path.join(__dirname, "..", "data", "grocery_prices.csv");

const importKaggleData = async () => {
  try {
    let mongoURI = process.env.MONGO_URI;
    if (!mongoURI || mongoURI === "your_mongodb_connection_string") {
      mongoURI = "mongodb://localhost:27017/smartcart-ai";
    }
    
    await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected for Kaggle Import: ${mongoURI}`);

    // Clear existing products and prices so we start fresh
    await Product.deleteMany({});
    await Price.deleteMany({});
    console.log("Existing Products and Prices cleared.");

    const productsMap = new Map();
    const pricesData = [];
    let count = 0;

    // Use a stream to safely process potentially large CSV files
    fs.createReadStream(dataPath)
      .pipe(csv())
      .on("data", (row) => {
        // Limit to 500 unique products to keep DB fast and match expected behaviour.
        if (productsMap.size > 500) return;
        
        let productName = row.product_name;
        
        if (!productsMap.has(productName)) {
           // Create a new product entry stub
           productsMap.set(productName, {
             name: productName,
             category: row.category,
             brand: row.brand,
             unit: row.unit,
             baseQuantity: parseInt(row.quantity) || 1,
             imageUrl: row.image_url
           });
        }
        
        pricesData.push({
           productName: productName, // We'll link this to ObjectId after inserting products
           store: row.store,
           price: parseFloat(row.price),
           timestamp: new Date()
        });
        
        count++;
      })
      .on("end", async () => {
        console.log(`CSV parsed. Extracted ${productsMap.size} unique products and ${pricesData.length} price points.`);
        
        // 1. Insert Products
        const productsToInsert = Array.from(productsMap.values());
        const insertedProducts = await Product.insertMany(productsToInsert);
        console.log(`Inserted ${insertedProducts.length} products to DB.`);

        // 2. Map Product Names to inserted ObjectIds
        const nameToIdMap = {};
        insertedProducts.forEach(p => {
           nameToIdMap[p.name] = p._id;
        });

        // 3. Prepare Prices
        const validPrices = pricesData
            .filter(p => nameToIdMap[p.productName])
            .map(p => ({
                productId: nameToIdMap[p.productName],
                store: p.store,
                price: p.price,
                timestamp: p.timestamp
            }));

        // 4. Insert Prices
        await Price.insertMany(validPrices);
        console.log(`Inserted ${validPrices.length} prices to DB.`);

        console.log("Kaggle Data Import Completed Successfully! 🔥");
        process.exit();
      })
      .on("error", (error) => {
         console.error("Error parsing CSV:", error);
         process.exit(1);
      });

  } catch (error) {
    console.error("Connection Error:", error);
    process.exit(1);
  }
};

importKaggleData();

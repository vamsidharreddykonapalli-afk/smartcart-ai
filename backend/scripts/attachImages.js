const mongoose = require("mongoose");
const Product = require("../models/Product");
const dotenv = require("dotenv");

// Load ENV
dotenv.config({ path: __dirname + "/../.env" });

// Dummy image mapping based on common grocery names
const imageMap = {
  "apple": "https://images.unsplash.com/photo-1560806887-1e4cd0b6faa6?w=400&q=80",
  "banana": "https://images.unsplash.com/photo-1571501474524-18151bc29f63?w=400&q=80",
  "milk": "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80",
  "bread": "https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=400&q=80",
  "eggs": "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80",
  "cheese": "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80",
  "tomato": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80",
  "chicken": "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&q=80",
  "beef": "https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?w=400&q=80",
  "potato": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80",
  "onion": "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&q=80",
  "rice": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80",
  "pasta": "https://images.unsplash.com/photo-1621996316523-a1c24df656a8?w=400&q=80",
  "coffee": "https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=400&q=80",
  "water": "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&q=80",
  "yogurt": "https://images.unsplash.com/photo-1584278860047-22db9ffca6bb?w=400&q=80",
  "butter": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80",
  "default": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80" // general grocery basket
};

const getImageUrlForName = (name) => {
  const lowerName = name.toLowerCase();
  for (const key of Object.keys(imageMap)) {
    if (lowerName.includes(key)) {
      return imageMap[key];
    }
  }
  return imageMap["default"];
};

async function attachImages() {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/smartcart-ai";
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB for updating images.");

    const products = await Product.find({});
    let updatedCount = 0;

    for (let product of products) {
      if (!product.imageUrl) {
        const urlToAssign = getImageUrlForName(product.name);
        product.imageUrl = urlToAssign;
        await product.save();
        updatedCount++;
        console.log(`Updated product: ${product.name} -> ${urlToAssign}`);
      }
    }

    console.log(`Finished! Updated ${updatedCount} products with image URLs.`);
    process.exit(0);
  } catch (err) {
    console.error("Error updating images:", err);
    process.exit(1);
  }
}

attachImages();

const Product = require("../models/Product");
const Price = require("../models/Price");

// ADD PRODUCT
exports.addProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD PRICE
exports.addPrice = async (req, res) => {
  try {
    const price = await Price.create(req.body);
    res.json(price);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const mongoose = require("mongoose");
const { getSearchRegex } = require("../utils/productMatcher");

// GET PRICES FOR PRODUCT (Comparison View)
exports.getPrices = async (req, res) => {
  try {
    const { productName } = req.params;

    // Find the product using fuzzy matching
    const product = await Product.findOne({ name: { $regex: getSearchRegex(productName) } });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Aggregate to get the LATEST price for each store
    const prices = await Price.aggregate([
      { $match: { productId: product._id } },
      { $sort: { timestamp: -1 } },
      { $group: {
          _id: "$store",
          price: { $first: "$price" },
          timestamp: { $first: "$timestamp" }
      }},
      { $project: {
          _id: 0,
          store: "$_id",
          price: 1,
          timestamp: 1
      }}
    ]);

    res.json({
      productName: product.name,
      productId: product._id,
      comparisons: prices
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL PRODUCTS
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET HOT DEALS
exports.getHotDeals = async (req, res) => {
  try {
    const products = await Product.find();
    const deals = [];

    // Calculate date for 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    for (let product of products) {
      // Find all prices in the last 7 days
      const prices = await Price.find({
        productId: product._id,
        timestamp: { $gte: sevenDaysAgo }
      }).sort({ timestamp: -1 });

      if (prices.length > 1) {
        // Group by store to calculate store-specific drops
        const storePrices = {};
        for (let p of prices) {
          if (!storePrices[p.store]) storePrices[p.store] = [];
          storePrices[p.store].push(p.price); // Prices are sorted latest to oldest
        }

        // Check if any store had a 10% drop over the week
        for (let store in storePrices) {
          const storeHistory = storePrices[store];
          if (storeHistory.length > 1) {
            const currentPrice = storeHistory[0]; // Latest price
            
            // Find highest price in the week
            let highestWeekPrice = currentPrice;
            for (let price of storeHistory) {
              if (price > highestWeekPrice) highestWeekPrice = price;
            }

            // Calculate drop percentage
            if (highestWeekPrice > currentPrice) {
              const dropPct = Math.round(((highestWeekPrice - currentPrice) / highestWeekPrice) * 100);
              
              if (dropPct >= 10) { // Require at least a 10% drop
                deals.push({
                  id: product._id + "_" + store, // Unique ID
                  name: product.name,
                  originalPrice: highestWeekPrice,
                  dealPrice: currentPrice,
                  store: store,
                  discount: dropPct + "%"
                });
              }
            }
          }
        }
      }
    }

    // Sort by highest discount
    deals.sort((a, b) => parseInt(b.discount) - parseInt(a.discount));

    // If no deals exist in the DB that drop 10%, inject dummy data
    if (deals.length === 0) {
       deals.push(
         { id: "d1", name: "Aashirvaad Atta (5kg)", originalPrice: 280, dealPrice: 240, store: "JioMart", discount: "14%" },
         { id: "d2", name: "Amul Butter (500g)", originalPrice: 255, dealPrice: 220, store: "Blinkit", discount: "13%" },
         { id: "d3", name: "Tropicana Orange Juice (1L)", originalPrice: 120, dealPrice: 90, store: "Zepto", discount: "25%" },
         { id: "d4", name: "Maggi 2-Minute Noodles (Pack of 4)", originalPrice: 56, dealPrice: 45, store: "BigBasket", discount: "19%" },
         { id: "d5", name: "Red Label Tea (1kg)", originalPrice: 450, dealPrice: 380, store: "Amazon Fresh", discount: "15%" },
         { id: "d6", name: "Fortune Sunflower Oil (1L)", originalPrice: 145, dealPrice: 120, store: "JioMart", discount: "17%" }
       );
    }

    // Deduplicate by product name so we don't show the same item multiple times
    const uniqueDealsMap = new Map();
    for (let deal of deals) {
      if (!uniqueDealsMap.has(deal.name) || parseInt(uniqueDealsMap.get(deal.name).discount) < parseInt(deal.discount)) {
        uniqueDealsMap.set(deal.name, deal);
      }
    }
    const finalDeals = Array.from(uniqueDealsMap.values());
    finalDeals.sort((a, b) => parseInt(b.discount) - parseInt(a.discount));

    res.json(finalDeals.slice(0, 15)); // Top 15 deals
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

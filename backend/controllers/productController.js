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

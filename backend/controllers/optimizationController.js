const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Price = require("../models/Price");

const { getSearchRegex } = require("../utils/productMatcher");

exports.optimizeCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user });

    if (!cart || cart.items.length === 0) {
      return res.json({ message: "Cart is empty", stores: [], totalCost: 0, originalCost: 0, savings: 0 });
    }

    let storeMap = {}; // store → items
    let totalCost = 0;
    let originalCost = 0;

    for (let item of cart.items) {
      // Improved matching: Case-insensitive regex with basic plural/singular handling
      const product = await Product.findOne({ name: { $regex: getSearchRegex(item.productName) } });

      if (!product) {
        console.warn(`Product not found: ${item.productName}`);
        continue;
      }

      const prices = await Price.find({ productId: product._id });

      if (prices.length === 0) {
        console.warn(`No prices found for product: ${item.productName}`);
        continue;
      }

      // Find cheapest price (Greedy Algorithm)
      let cheapest = prices[0];
      let maxPrice = prices[0]; // To calculate potential savings from the worst case

      for (let p of prices) {
        if (p.price < cheapest.price) cheapest = p;
        if (p.price > maxPrice.price) maxPrice = p;
      }

      const itemCost = cheapest.price * item.quantity;
      const itemOriginal = maxPrice.price * item.quantity;

      totalCost += itemCost;
      originalCost += itemOriginal;

      // Group by store
      if (!storeMap[cheapest.store]) {
        storeMap[cheapest.store] = [];
      }

      storeMap[cheapest.store].push({
        productName: item.productName,
        quantity: item.quantity,
        price: cheapest.price,
        total: itemCost
      });
    }

    const savings = originalCost - totalCost;

    res.json({
      stores: Object.keys(storeMap).map(store => ({
        store,
        items: storeMap[store],
        storeTotal: storeMap[store].reduce((sum, item) => sum + item.total, 0)
      })),
      totalCost,
      originalCost,
      savings
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

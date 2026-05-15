const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { getSearchRegex } = require("../utils/productMatcher");

// GET CART
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user });
    res.json(cart || { items: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD ITEM
exports.addItem = async (req, res) => {
  try {
    const { productName, quantity } = req.body;

    // Fuzzy match: case-insensitive, partial name match
    const searchRegex = new RegExp(productName.trim(), "i");
    const productExists = await Product.findOne({ name: { $regex: searchRegex } });
    if (!productExists) {
      return res.status(400).json({ message: `There is no product like '${productName}' in our grocery database. Try: Milk, Tomato, Onion, Rice, Chicken, Eggs, Atta, Apple, Banana.` });
    }
    // Use the actual matched product name for consistency
    const matchedName = productExists.name;

    let cart = await Cart.findOne({ userId: req.user });

    if (!cart) {
      cart = new Cart({ userId: req.user, items: [] });
    }

    const existingItem = cart.items.find(
      item => item.productName === productName
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productName, quantity });
    }

    await cart.save();
    res.json(cart);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE ITEM
exports.updateItem = async (req, res) => {
  try {
    const { productName, quantity } = req.body;

    const cart = await Cart.findOne({ userId: req.user });

    cart.items = cart.items.map(item =>
      item.productName === productName
        ? { ...item.toObject(), quantity }
        : item
    );

    await cart.save();
    res.json(cart);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE ITEM
exports.deleteItem = async (req, res) => {
  try {
    const { productName } = req.body;

    const cart = await Cart.findOne({ userId: req.user });

    cart.items = cart.items.filter(
      item => item.productName !== productName
    );

    await cart.save();
    res.json(cart);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Order = require("../models/Order");
const Cart = require("../models/Cart");

exports.checkout = async (req, res) => {
  try {
    const { items, totalCost, savings } = req.body;
    const userId = req.user.id;

    const newOrder = new Order({
      userId,
      items,
      totalCost,
      savings,
      date: new Date()
    });

    await newOrder.save();

    // Clear the cart after successful checkout
    await Cart.findOneAndUpdate({ userId }, { items: [] });

    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (err) {
    res.status(500).json({ message: "Checkout failed", error: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
};

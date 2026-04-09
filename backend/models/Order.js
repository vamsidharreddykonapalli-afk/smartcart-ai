const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [
    {
      productName: String,
      quantity: Number,
      price: Number,
      store: String,
      category: {
        type: String,
        default: "Grocery"
      }
    }
  ],
  totalCost: Number,
  savings: Number,
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);

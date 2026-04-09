const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  items: [
    {
      productName: String,
      quantity: Number,
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);

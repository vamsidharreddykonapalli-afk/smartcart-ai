const mongoose = require("mongoose");

const priceSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  store: {
    type: String,
    enum: ["BigBasket", "Zepto", "Blinkit", "Instamart", "JioMart", "Swiggy", "Amazon Fresh"]
  },
  price: Number,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Price", priceSchema);

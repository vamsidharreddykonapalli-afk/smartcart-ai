const mongoose = require('mongoose');
const Price = require('../models/Price');
const Product = require('../models/Product');

mongoose.connect("mongodb://localhost:27017/smartcart-ai").then(async () => {
    console.log("Products:", await Product.countDocuments());
    console.log("Prices:", await Price.countDocuments());
    process.exit(0);
}).catch(console.error);

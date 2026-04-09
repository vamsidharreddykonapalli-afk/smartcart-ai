const mongoose = require('mongoose');

async function testSearch(searchTerm) {
  await mongoose.connect('mongodb://localhost:27017/smartcart-ai');
  
  const Product = mongoose.model('Product', new mongoose.Schema({ name: String }));
  
  // Try case-insensitive substring match
  // We'll also try to handle singular/plural roughly by checking substrings
  const searchRegex = new RegExp(searchTerm.replace(/s$/, ''), 'i');
  
  const products = await Product.find({ name: { $regex: searchRegex } });
  
  console.log(`Search for "${searchTerm}" found:`, products.map(p => p.name));
  
  await mongoose.disconnect();
}

const term = process.argv[2] || 'milk';
testSearch(term);

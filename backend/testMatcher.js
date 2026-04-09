const mongoose = require('mongoose');
const { getSearchRegex } = require('./utils/productMatcher');

async function testMatcher(searchTerm) {
  try {
    await mongoose.connect('mongodb://localhost:27017/smartcart-ai');
    
    // Define temporary schema if not already globally defined
    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({ name: String }));
    
    const regex = getSearchRegex(searchTerm);
    console.log(`Testing search for: "${searchTerm}" with regex: ${regex}`);
    
    const results = await Product.find({ name: { $regex: regex } });
    console.log(`Results found:`, results.map(r => r.name));
    
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

const term = process.argv[2] || 'milks';
testMatcher(term);

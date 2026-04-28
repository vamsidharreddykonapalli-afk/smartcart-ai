const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const Price = require('../models/Price');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const STORES = ['BigBasket', 'Zepto', 'Blinkit', 'Instamart', 'JioMart'];

const sampleProducts = [
  { name: 'Amul Milk 1L', category: 'Dairy', brand: 'Amul', unit: 'liter', baseQuantity: 1, basePrice: 54 },
  { name: 'Basmati Rice 5kg', category: 'Grains', brand: 'India Gate', unit: 'kg', baseQuantity: 5, basePrice: 600 },
  { name: 'Fresh Tomatoes', category: 'Vegetables', brand: 'Fresh', unit: 'kg', baseQuantity: 1, basePrice: 40 },
  { name: 'Britannia Bread', category: 'Bakery', brand: 'Britannia', unit: 'piece', baseQuantity: 1, basePrice: 35 },
  { name: 'Amul Butter 500g', category: 'Dairy', brand: 'Amul', unit: 'gram', baseQuantity: 500, basePrice: 250 },
];

async function createSampleData() {
  try {
    const dbUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(dbUri);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing data
    await Product.deleteMany({});
    await Price.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create products
    const products = await Product.insertMany(
      sampleProducts.map(p => ({
        name: p.name,
        category: p.category,
        brand: p.brand,
        unit: p.unit,
        baseQuantity: p.baseQuantity,
        imageUrl: 'https://via.placeholder.com/200',
        aliases: [p.name.toLowerCase()],
        description: `${p.brand} ${p.name}`
      }))
    );
    console.log(`✅ Created ${products.length} products`);

    // Create prices for each product in each store
    const allPrices = [];
    products.forEach((product, index) => {
      const basePrice = sampleProducts[index].basePrice;
      
      STORES.forEach(store => {
        // Add realistic variation per store
        const storeFactors = {
          'BigBasket': 1.0,
          'Zepto': 1.08,
          'Blinkit': 1.05,
          'Instamart': 0.98,
          'JioMart': 0.95
        };
        
        const price = Math.round(basePrice * storeFactors[store]);
        
        allPrices.push({
          productId: product._id,
          store: store,
          price: price,
          originalPrice: Math.round(price * 1.15),
          inStock: true,
          discount: 13,
          timestamp: new Date()
        });
      });
    });

    await Price.insertMany(allPrices);
    console.log(`✅ Created ${allPrices.length} price entries`);

    console.log('\n🎉 Sample data created successfully!');
    console.log(`📊 Products: ${products.length}`);
    console.log(`💰 Prices: ${allPrices.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createSampleData();

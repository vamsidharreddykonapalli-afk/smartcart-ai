const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("../models/Product");
const Price = require("../models/Price");
const Order = require("../models/Order");

dotenv.config();

const seedData = async () => {
  try {
    let mongoURI = process.env.MONGO_URI;
    if (!mongoURI || mongoURI === "your_mongodb_connection_string") {
      mongoURI = "mongodb://localhost:27017/smartcart-ai";
    }
    await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected for Seeding to: ${mongoURI}...`);

    // Clear existing data
    await Product.deleteMany({});
    await Price.deleteMany({});
    await Order.deleteMany({});
    console.log("Existing data cleared.");

    // Define Products (50+ Items)
    const productsData = [
      // Dairy
      { name: "Milk (1L)", category: "Dairy" },
      { name: "Butter (500g)", category: "Dairy" },
      { name: "Cheese Slices", category: "Dairy" },
      { name: "Paneer (200g)", category: "Dairy" },
      { name: "Curd (1kg)", category: "Dairy" },
      { name: "Whipping Cream", category: "Dairy" },
      // Grains & Staples
      { name: "Basmati Rice (5kg)", category: "Staples" },
      { name: "Atta (10kg)", category: "Staples" },
      { name: "Toor Dal (1kg)", category: "Staples" },
      { name: "Moong Dal (1kg)", category: "Staples" },
      { name: "Sugar (1kg)", category: "Staples" },
      { name: "Salt (1kg)", category: "Staples" },
      { name: "Sunflower Oil (1L)", category: "Staples" },
      { name: "Ghee (500ml)", category: "Staples" },
      // Fruits & Vegetables
      { name: "Onion (1kg)", category: "Produce" },
      { name: "Potato (1kg)", category: "Produce" },
      { name: "Tomato (1kg)", category: "Produce" },
      { name: "Banana (6 units)", category: "Produce" },
      { name: "Apple (1kg)", category: "Produce" },
      { name: "Spinach", category: "Produce" },
      { name: "Garlic (100g)", category: "Produce" },
      { name: "Ginger (100g)", category: "Produce" },
      // Bakery & Snacks
      { name: "Whole Wheat Bread", category: "Bakery" },
      { name: "Chocolate Cookies", category: "Snacks" },
      { name: "Potato Chips", category: "Snacks" },
      { name: "Mixed Nuts (200g)", category: "Snacks" },
      { name: "Peanut Butter", category: "Snacks" },
      { name: "Dark Chocolate", category: "Snacks" },
      // Beverages
      { name: "Green Tea (25 bags)", category: "Beverages" },
      { name: "Instant Coffee (100g)", category: "Beverages" },
      { name: "Orange Juice (1L)", category: "Beverages" },
      { name: "Sparkling Water", category: "Beverages" },
      { name: "Soda (500ml)", category: "Beverages" },
      // Household
      { name: "Dish Soap (500ml)", category: "Household" },
      { name: "Laundry Liquid (2L)", category: "Household" },
      { name: "Paper Towels (2 ply)", category: "Household" },
      { name: "Floor Cleaner", category: "Household" },
      { name: "Trash Bags", category: "Household" },
      // Personal Care
      { name: "Hand Wash (250ml)", category: "Bathroom" },
      { name: "Shampoo (400ml)", category: "Bathroom" },
      { name: "Toothpaste (150g)", category: "Bathroom" },
      { name: "Shower Gel", category: "Bathroom" },
      { name: "Face Wash", category: "Bathroom" },
      // Spices
      { name: "Turmeric Powder (200g)", category: "Spices" },
      { name: "Chilli Powder (200g)", category: "Spices" },
      { name: "Cumin Seeds (100g)", category: "Spices" },
      { name: "Coriander Powder", category: "Spices" },
      { name: "Black Pepper", category: "Spices" },
    ];

    const products = await Product.insertMany(productsData);
    console.log(`Seeded ${products.length} Products.`);

    const storeNames = ["BigBasket", "Zepto", "Blinkit", "Instamart", "Swiggy", "Amazon Fresh"];
    const productMap = products.reduce((acc, p) => {
      acc[p.name] = p._id;
      return acc;
    }, {});

    const pricesData = [];

    // Realistic price generator
    products.forEach((product) => {
      // Base price random range between 40 and 600
      const basePrice = Math.floor(Math.random() * (600 - 40) + 40);
      
      storeNames.forEach((store) => {
        // Price variation +/- 15%
        const variation = (Math.random() * 0.3) - 0.15;
        const storePrice = Math.round(basePrice * (1 + variation));
        
        pricesData.push({
          productId: product._id,
          store: store,
          price: storePrice
        });
      });
    });

    await Price.insertMany(pricesData);
    console.log(`Seeded ${pricesData.length} Prices across all stores.`);

    // Mock Orders for Analytics Demo
    const dummyUserId = new mongoose.Types.ObjectId();
    const ordersData = [];

    for (let i = 0; i < 8; i++) {
        const orderDate = new Date();
        orderDate.setDate(orderDate.getDate() - (8 - i) * 3); // Spaced-out dates

        const orderItems = [];
        const numItems = Math.floor(Math.random() * 5) + 3;
        let totalCost = 0;
        let savings = 0;

        for (let j = 0; j < numItems; j++) {
            const product = products[Math.floor(Math.random() * products.length)];
            const store = storeNames[Math.floor(Math.random() * storeNames.length)];
            const price = Math.floor(Math.random() * 200) + 50;
            
            orderItems.push({
                productName: product.name,
                quantity: Math.floor(Math.random() * 3) + 1,
                price: price,
                store: store,
                category: product.category
            });
            totalCost += price;
            savings += Math.floor(price * 0.15); // Mock 15% savings
        }

        ordersData.push({
            userId: dummyUserId,
            items: orderItems,
            totalCost,
            savings,
            date: orderDate
        });
    }

    await Order.insertMany(ordersData);
    console.log(`Seeded ${ordersData.length} Mock Orders for Analytics.`);

    console.log("Seeding Completed Successfully! 🔥");
    process.exit();
  } catch (err) {
    console.error("Error seeding data:", err);
    process.exit(1);
  }
};

seedData();

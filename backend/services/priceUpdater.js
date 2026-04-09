const cron = require("node-cron");
const Price = require("../models/Price");
const { io } = require("../server");

// Run every 1 minute for demonstration (Change to '0 * * * *' for 1 hour in production)
cron.schedule("*/1 * * * *", async () => {
  console.log("Running simulated price adjustment...");

  try {
    // Limit to a random subset to prevent Out Of Memory crashes on large datasets
    const prices = await Price.aggregate([{ $sample: { size: 50 } }]);

    for (let priceObj of prices) {
      const oldPrice = priceObj.price;

      // Simulate price change (-3 to +3)
      const change = Math.floor(Math.random() * 7) - 3;
      const newPrice = Math.max(10, oldPrice + change); // Keep price above 10

      if (newPrice !== oldPrice) {
        // Create NEW document for history
        await Price.create({
          productId: priceObj.productId,
          store: priceObj.store,
          price: newPrice,
          timestamp: new Date()
        });

        // Notify via Socket.io
        io.emit("priceUpdate", {
          productId: priceObj.productId,
          oldPrice,
          newPrice,
          store: priceObj.store,
        });
        
        console.log(`Alert: ${priceObj.store} price changed ${oldPrice} -> ${newPrice}`);
      }
    }
  } catch (err) {
    console.error("Price update service error:", err);
  }
});

const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const authMiddleware = require("../middleware/authMiddleware");

const { getPrices } = require("../controllers/productController");

// Protected Analytics Endpoints
router.get("/", authMiddleware, analyticsController.getAnalytics);
router.get("/price-history/:productName", authMiddleware, analyticsController.getPriceHistory);
router.get("/price-prediction/:productName", authMiddleware, analyticsController.getPricePrediction);
router.get("/compare/:productName", authMiddleware, getPrices);

module.exports = router;

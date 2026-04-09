const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected Checkout Routes
router.post("/checkout", authMiddleware, orderController.checkout);
router.get("/", authMiddleware, orderController.getOrders);

module.exports = router;

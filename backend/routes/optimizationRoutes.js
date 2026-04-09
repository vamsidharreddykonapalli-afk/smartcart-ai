const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { optimizeCart } = require("../controllers/optimizationController");

router.get("/", authMiddleware, optimizeCart);

module.exports = router;

const express = require("express");
const router = express.Router();

const {
  addProduct,
  addPrice,
  getPrices,
  getProducts
} = require("../controllers/productController");

router.post("/add-product", addProduct);
router.post("/add-price", addPrice);
router.get("/prices/:productName", getPrices);
router.get("/compare/:productName", getPrices);
router.get("/", getProducts);

module.exports = router;

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  getCart,
  addItem,
  updateItem,
  deleteItem
} = require("../controllers/cartController");

router.get("/", authMiddleware, getCart);
router.post("/add", authMiddleware, addItem);
router.put("/update", authMiddleware, updateItem);
router.delete("/delete", authMiddleware, deleteItem);

module.exports = router;

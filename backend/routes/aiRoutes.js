const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { getAISuggestions, geminiChat } = require("../controllers/aiController");

router.post("/", authMiddleware, getAISuggestions);
router.post("/chat", authMiddleware, geminiChat);

module.exports = router;

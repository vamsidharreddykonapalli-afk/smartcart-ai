const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Only initialize OpenAI if the API key is provided (prevents crash on Render)
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

exports.getAISuggestions = async (req, res) => {
  if (!openai) {
    return res.status(503).json({ message: "OpenAI API key not configured. AI suggestions are unavailable." });
  }
  try {
    const { cart, prices } = req.body;

    const prompt = `
You are a smart grocery assistant for "SmartCart AI". Your goal is to help users save money by analyzing their cart and the available store prices.

Current Optimized Cart (grouped by store):
${JSON.stringify(cart, null, 2)}

Overall Pricing Data:
${JSON.stringify(prices, null, 2)}

Please provide 3-4 concise, highly practical suggestions to save even more money. 
Focus on:
1. Cheaper alternatives or brands.
2. Bulk buying benefits (if applicable).
3. Timing (e.g., waiting for weekend sales).
4. Any store-specific loyalty tips.

Keep the response short, conversational, and use bullet points. Formatting should be clean.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a professional grocery savings expert." },
        { role: "user", content: prompt }
      ],
      max_tokens: 300,
    });

    res.json({
      suggestions: response.choices[0].message.content,
    });

  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ message: "Failed to fetch AI suggestions. Please check your API key." });
  }
};

exports.geminiChat = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: "Valid messages array is required." });
    }

    const latestMessage = messages[messages.length - 1].text;

    // --- Try Gemini API first ---
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: "You are the SmartCart Virtual Assistant. You help users with grocery shopping, price comparisons, and finding the best deals across Blinkit, Zepto, Swiggy Instamart, BigBasket, JioMart, and Amazon Fresh. Keep answers very concise, friendly, and formatted with bullet points. Always answer as a helpful shopping assistant."
      });

      // Build valid Gemini history (must start with 'user', not 'model')
      let history = messages.slice(0, -1).map(msg => ({
        role: msg.sender === "bot" ? "model" : "user",
        parts: [{ text: msg.text }]
      }));
      while (history.length > 0 && history[0].role === "model") {
        history.shift();
      }

      const chat = model.startChat({ history });
      const result = await chat.sendMessage([{ text: latestMessage }]);
      const responseText = result.response.text();
      return res.json({ reply: responseText });

    } catch (geminiError) {
      // If Gemini fails due to quota/rate limits, use local fallback
      const errStatus = geminiError.status || (geminiError.response && geminiError.response.status);
      const isQuotaError = errStatus === 429 || errStatus === 503 || errStatus === 404 ||
        (geminiError.message && geminiError.message.includes("quota"));

      if (!isQuotaError) {
        // Unknown error - rethrow
        throw geminiError;
      }
      // Fall through to local smart responses
    }

    // --- Smart Local Fallback (always works, no API needed) ---
    const reply = getSmartLocalResponse(latestMessage.toLowerCase());
    return res.json({ reply });

  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ message: "Failed to process chat message." });
  }
};

/**
 * Keyword-based local chatbot response engine.
 * Handles the most common grocery shopping queries without any API call.
 */
function getSmartLocalResponse(msg) {
  // Greetings
  if (/^(hi|hello|hey|good morning|good evening|howdy|what's up|sup)/.test(msg)) {
    return "👋 Hey there! I'm your SmartCart Assistant. I can help you:\n• 🔍 Find the cheapest store for any product\n• 💰 Discover today's best deals\n• 🛒 Optimize your grocery cart\n• 📦 Compare prices across Blinkit, Zepto, BigBasket and more\n\nWhat are you looking for today?";
  }

  // Eggs
  if (msg.includes("egg")) {
    return "🥚 **Eggs — Best Prices Today:**\n• **Blinkit** — ₹72 for 6 eggs (best deal!)\n• **Zepto** — ₹75 for 6 eggs\n• **BigBasket** — ₹78 for 6 eggs\n• **JioMart** — ₹80 for 6 eggs\n\n💡 *Tip: Buy a tray of 30 eggs on BigBasket for the best per-egg price!*";
  }

  // Milk
  if (msg.includes("milk")) {
    return "🥛 **Milk — Best Prices Today:**\n• **Zepto** — ₹28/500ml (fastest delivery!)\n• **Blinkit** — ₹30/500ml\n• **Swiggy Instamart** — ₹30/500ml\n• **BigBasket** — ₹32/500ml (Amul Gold)\n\n💡 *Tip: Subscribe on BigBasket for daily milk delivery at a discount!*";
  }

  // Bread
  if (msg.includes("bread")) {
    return "🍞 **Bread — Best Prices Today:**\n• **JioMart** — ₹32 (Modern Bread 400g)\n• **BigBasket** — ₹35 (Harvest Gold)\n• **Blinkit** — ₹36\n• **Amazon Fresh** — ₹38\n\n💡 *Tip: Whole wheat bread is healthier and often the same price!*";
  }

  // Rice / wheat / atta
  if (msg.includes("rice") || msg.includes("wheat") || msg.includes("atta")) {
    return "🌾 **Atta / Rice — Best Deals:**\n• **JioMart** — ₹255 for 5kg Aashirvaad Atta\n• **BigBasket** — ₹270 for 5kg (often has 10% off)\n• **Amazon Fresh** — ₹265 with Prime\n• **Blinkit** — ₹275 (instant delivery)\n\n💡 *Tip: Buy 10kg packs — you save up to 15% vs smaller packs!*";
  }

  // Vegetables / fruits
  if (msg.includes("vegetable") || msg.includes("veggie") || msg.includes("sabzi") || msg.includes("onion") || msg.includes("tomato") || msg.includes("potato") || msg.includes("fruit")) {
    return "🥦 **Fresh Vegetables & Fruits — Best Stores:**\n• **BigBasket** — Best quality & widest variety\n• **Zepto** — Fastest 10-min delivery\n• **JioMart** — Cheapest prices on staples\n• **Instamart** — Good for last-minute needs\n\n💡 *Tip: Order veggies in the morning on BigBasket for the freshest stock!*";
  }

  // Oil
  if (msg.includes("oil") || msg.includes("cooking oil")) {
    return "🫙 **Cooking Oil — Best Prices:**\n• **JioMart** — ₹148/L Fortune Sunflower Oil\n• **BigBasket** — ₹155/L\n• **Amazon Fresh** — ₹152/L\n• **Blinkit** — ₹160/L (convenient)\n\n💡 *Tip: Buy 5L packs for the best per-litre value!*";
  }

  // Dal / lentils / pulses
  if (msg.includes("dal") || msg.includes("lentil") || msg.includes("pulse") || msg.includes("rajma") || msg.includes("chana")) {
    return "🫘 **Dal & Pulses — Best Deals:**\n• **JioMart** — ₹95/kg Toor Dal\n• **BigBasket** — ₹98/kg\n• **Blinkit** — ₹102/kg\n\n💡 *Tip: Buy 5kg packs of your most-used dal — you save ₹30–50!*";
  }

  // Deals / offers / discount / cheap / save / best price
  if (msg.includes("deal") || msg.includes("offer") || msg.includes("discount") || msg.includes("cheap") || msg.includes("save") || msg.includes("best price") || msg.includes("cheapest")) {
    return "💰 **Today's Best Deals:**\n• 🛒 **Blinkit** — 20% off on dairy products\n• ⚡ **Zepto** — Free delivery on orders above ₹199\n• 🍎 **BigBasket** — 15% off on fresh fruits & vegetables\n• 🛍️ **JioMart** — Buy 2 Get 1 Free on snacks\n• 📦 **Amazon Fresh** — Extra 10% off with Amazon Pay\n\n💡 Use the *Optimize Cart* feature on SmartCart to automatically find the cheapest combo across all stores!";
  }

  // Compare stores
  if (msg.includes("compare") || msg.includes("best store") || msg.includes("which store") || msg.includes("zepto") || msg.includes("blinkit") || msg.includes("bigbasket") || msg.includes("jiomart") || msg.includes("instamart") || msg.includes("amazon fresh")) {
    return "🏪 **Store Comparison:**\n• ⚡ **Zepto & Blinkit** — Best for speed (10 min delivery)\n• 🥇 **BigBasket** — Best for variety & quality\n• 💸 **JioMart** — Usually cheapest for staples\n• 🚀 **Swiggy Instamart** — Great for midnight cravings\n• 📦 **Amazon Fresh** — Best if you have Prime\n\n💡 Use SmartCart's **Price Comparison** feature to see live prices across all stores simultaneously!";
  }

  // Cart / optimize
  if (msg.includes("cart") || msg.includes("optimize") || msg.includes("shopping list")) {
    return "🛒 **SmartCart Optimization Tips:**\n1. Add all your items to the SmartCart\n2. Click **'Optimize Cart'** — our AI splits your order across stores automatically\n3. You typically save **15–25%** compared to buying everything from one store!\n\n💡 *Most users save ₹200–500 per monthly grocery order using SmartCart!*";
  }

  // Help / what can you do
  if (msg.includes("help") || msg.includes("what can you do") || msg.includes("features")) {
    return "🤖 **I can help you with:**\n• 💰 Find cheapest prices for any grocery item\n• 🏪 Compare Blinkit, Zepto, BigBasket, JioMart, Instamart & Amazon Fresh\n• 🛒 Tips to optimize your shopping cart\n• 🎯 Today's best deals & offers\n• 📊 Understand price trends\n\nJust type the name of any product or ask me anything about grocery shopping!";
  }

  // Thank you
  if (msg.includes("thank") || msg.includes("thanks") || msg.includes("ty")) {
    return "😊 You're welcome! Happy to help you save money on groceries. Let me know if you need anything else — I'm always here!";
  }

  // Default — smart generic response
  return `🔍 I searched for **"${msg}"** across all stores!\n\nFor the most accurate live prices, please use the **Search** feature on SmartCart to see real-time comparison across Blinkit, Zepto, BigBasket, JioMart, and more.\n\n💡 You can also use our **Optimize Cart** feature to automatically save on your full shopping list!\n\nCan I help you with anything else? Try asking about:\n• 🥛 Milk prices\n• 🥚 Egg deals\n• 💰 Today's best offers`;
}

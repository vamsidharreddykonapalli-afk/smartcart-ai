const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

exports.getAISuggestions = async (req, res) => {
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

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: "You are the SmartCart Virtual Assistant. You help users with grocery shopping, price comparisons, and finding deals. Keep answers very concise, friendly, and formatted nicely. Never mention that you are an AI, always act like a shopping assistant."
    });

    // Format history for Gemini SDK
    // SDK expects format: { role: 'user' | 'model', parts: [{ text: "..." }] }
    // User messages come as { sender: 'user' | 'bot', text: "..." }
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.sender === "bot" ? "model" : "user",
      parts: [{ text: msg.text }]
    }));
    
    const latestMessage = messages[messages.length - 1].text;

    const chat = model.startChat({ history });
    const result = await chat.sendMessage([{ text: latestMessage }]);
    const responseText = result.response.text();

    res.json({ reply: responseText });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ message: "Failed to process chat message." });
  }
};

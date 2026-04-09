/**
 * Predicts the next 7 days of prices based on a simple linear trend (slope).
 * Adds a small amount of "market volatility" for realism.
 * @param {Array<number>} history - The last 7-10 days of prices.
 * @returns {Array<number>} - An array of 7 predicted prices.
 */
exports.predictNext7Days = (history) => {
  if (!history || history.length < 2) return Array(7).fill(history[0] || 0);

  // Calculate Average Daily Change (Simple Slope)
  // (Latest - Oldest) / Days
  const latestPrice = history[history.length - 1];
  const oldestPrice = history[0];
  const dailyChange = (latestPrice - oldestPrice) / (history.length - 1);

  const predictions = [];
  let currentPrice = latestPrice;

  for (let i = 1; i <= 7; i++) {
    // Project the trend
    currentPrice += dailyChange;
    
    // Add random "market volatility" ±2%
    const volatility = (Math.random() * 0.04 - 0.02) * currentPrice;
    const finalPrice = Math.round((currentPrice + volatility) * 100) / 100;
    
    // Ensure price never drops below a reasonable minimum (e.g., 10)
    predictions.push(Math.max(10, finalPrice));
  }

  return predictions;
};

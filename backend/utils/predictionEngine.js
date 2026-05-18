/**
 * SmartCart AI — Price Prediction Engine v3
 *
 * Uses Ordinary Least Squares (OLS) Linear Regression over the full
 * price history to compute a best-fit line (y = mx + b), then projects
 * that line forward 7 days to forecast next-week prices.
 *
 * Each store also has a unique pricing personality (trend bias + volatility)
 * that nudges the regression line to produce visually distinct, realistic
 * forecast curves per retailer.
 */

// ── Store personality ─────────────────────────────────────────────────────────
// trendBias: daily ₹ adjustment added on top of regression projection
//   > 0  → store prices tend to creep up (quick-commerce premium)
//   < 0  → store runs promotions / discounts
// volatilityPct: fraction of price used as Gaussian noise std-dev
const STORE_PERSONALITY = {
  "BigBasket":    { trendBias: -0.25, volatilityPct: 0.05 },
  "Zepto":        { trendBias:  0.40, volatilityPct: 0.05 },
  "Blinkit":      { trendBias:  0.35, volatilityPct: 0.05 },
  "Instamart":    { trendBias:  0.20, volatilityPct: 0.05 },
  "JioMart":      { trendBias: -0.45, volatilityPct: 0.05 },
  "Swiggy":       { trendBias:  0.30, volatilityPct: 0.05 },
  "Amazon Fresh": { trendBias: -0.15, volatilityPct: 0.05 },
};

// ── OLS Linear Regression ─────────────────────────────────────────────────────
/**
 * Fits y = slope * x + intercept to (x[0..n-1], prices) using OLS.
 * Returns slope, intercept, and R² (goodness-of-fit, 0–1).
 *
 * @param {number[]} prices  - Price series (oldest → newest, index = day)
 * @returns {{ slope: number, intercept: number, rSquared: number }}
 */
function linearRegression(prices) {
  const n = prices.length;
  if (n < 2) return { slope: 0, intercept: prices[0] || 0, rSquared: 0 };

  // x values are simply the day index: 0, 1, 2 … n-1
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX  += i;
    sumY  += prices[i];
    sumXY += i * prices[i];
    sumX2 += i * i;
  }

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: sumY / n, rSquared: 1 };

  const slope     = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  // R² — how well the line explains the data
  const yMean = sumY / n;
  let ssTot = 0, ssRes = 0;
  for (let i = 0; i < n; i++) {
    ssTot += Math.pow(prices[i] - yMean, 2);
    ssRes += Math.pow(prices[i] - (slope * i + intercept), 2);
  }
  const rSquared = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);

  return { slope, intercept, rSquared };
}

// ── Deterministic pseudo-random ───────────────────────────────────────────────
/**
 * Produces a stable [0, 1) value for a given integer seed.
 * Charts don't flicker on re-renders.
 */
function seededRandom(seed) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

// ── Public API ────────────────────────────────────────────────────────────────
/**
 * Predicts the next 7 days of prices for a single store using OLS regression.
 *
 * @param {number[]} history         - Daily average price series (oldest→newest)
 * @param {string}  [store=""]       - Store name (for personality lookup)
 * @param {number}  [seed=0]         - Base seed for deterministic volatility
 * @returns {{ predictions: number[], slope: number, intercept: number, rSquared: number }}
 */
exports.predictNext7Days = (history, store = "", seed = 0) => {
  if (!history || history.length === 0) {
    return { predictions: Array(7).fill(100), slope: 0, intercept: 100, rSquared: 0 };
  }

  const { slope, intercept, rSquared } = linearRegression(history);
  const personality = STORE_PERSONALITY[store] || { trendBias: 0, volatilityPct: 0.020 };
  const n = history.length; // last known day index

  const predictions = [];

  for (let i = 1; i <= 7; i++) {
    // OLS projection: price at day (n - 1 + i)
    const dayIndex   = n - 1 + i;
    const projected  = slope * dayIndex + intercept;

    // Add store-specific trend bias (per day beyond history)
    const biasedPrice = projected + personality.trendBias * i;

    // Deterministic Gaussian noise via Box-Muller transform
    const r1   = Math.max(0.0001, seededRandom(seed + i * 13));
    const r2   = seededRandom(seed + i * 7 + 999);
    const gauss = Math.sqrt(-2 * Math.log(r1)) * Math.cos(2 * Math.PI * r2);
    const noise  = gauss * personality.volatilityPct * biasedPrice;

    const finalPrice = Math.round(Math.max(10, biasedPrice + noise) * 100) / 100;
    predictions.push(finalPrice);
  }

  return { predictions, slope, intercept, rSquared };
};

/**
 * Returns full regression metadata for a store's history.
 * Useful for displaying slope / R² on the frontend.
 *
 * @param {number[]} history - Daily average price series
 * @returns {{ slope: number, intercept: number, rSquared: number }}
 */
exports.getRegression = (history) => linearRegression(history);

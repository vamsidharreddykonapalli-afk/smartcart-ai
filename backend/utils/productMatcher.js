/**
 * Smart product name matcher with tiered search strategy:
 * 1. Exact match (case-insensitive): "milk" → finds "Milk"
 * 2. Starts-with match: "milk" → finds "Milk 500ml"
 * 3. Word-boundary match: "milk" → finds "Amul Milk"
 * 4. Contains fallback (last resort)
 */

/**
 * Find the best matching product using tiered strategy
 * @param {Model} ProductModel - Mongoose Product model
 * @param {string} searchTerm - User's input
 * @returns {Document|null} - Best matching product document
 */
exports.findBestMatch = async (ProductModel, searchTerm) => {
  const term = searchTerm.trim();
  if (!term) return null;

  // Tier 1: Exact match (case-insensitive)
  let product = await ProductModel.findOne({
    name: { $regex: new RegExp(`^${escapeRegex(term)}$`, "i") }
  });
  if (product) return product;

  // Tier 2: Starts with the term (e.g. "milk" → "Milk 500ml")
  product = await ProductModel.findOne({
    name: { $regex: new RegExp(`^${escapeRegex(term)}`, "i") }
  });
  if (product) return product;

  // Tier 3: Word boundary — term is a standalone word (e.g. "milk" → "Amul Milk")
  // Sort by name length (ascending) so we prefer shorter/simpler names
  const wordBoundaryMatches = await ProductModel.find({
    name: { $regex: new RegExp(`\\b${escapeRegex(term)}\\b`, "i") }
  }).sort({ name: 1 }).limit(5);

  if (wordBoundaryMatches.length > 0) {
    // Prefer the shortest name (most likely the generic product)
    return wordBoundaryMatches.sort((a, b) => a.name.length - b.name.length)[0];
  }

  // Tier 4: Contains fallback (only for longer terms > 4 chars)
  if (term.length > 4) {
    const containsMatches = await ProductModel.find({
      name: { $regex: new RegExp(escapeRegex(term), "i") }
    }).limit(5);
    if (containsMatches.length > 0) {
      return containsMatches.sort((a, b) => a.name.length - b.name.length)[0];
    }
  }

  return null;
};

/**
 * Simple regex for use in aggregation pipelines (backward compat)
 */
exports.getSearchRegex = (productName) => {
  if (!productName) return new RegExp("");
  const term = productName.length > 3 ? productName.replace(/s$/, "") : productName;
  return new RegExp(`\\b${escapeRegex(term)}`, "i");
};

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Generates a fuzzy search regex for product names.
 * Handles case-insensitivity and simple pluralization (stripping trailing 's').
 * @param {string} productName - The product name to match.
 * @returns {RegExp} - The regex for MongoDB $regex search.
 */
exports.getSearchRegex = (productName) => {
  if (!productName) return new RegExp('');
  
  // Basic pluralization handling: strip trailing 's' if name is longer than 3 chars
  // (to avoid stripping 's' from short words like 'Bus' or 'Gas')
  const searchTerm = productName.length > 3 ? productName.replace(/s$/, '') : productName;
  
  // Return a case-insensitive regex for substring match
  return new RegExp(searchTerm, 'i');
};

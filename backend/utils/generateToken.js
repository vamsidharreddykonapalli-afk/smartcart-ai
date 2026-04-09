const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Extended for better UX in dev, adjust as needed
  });
};

module.exports = generateToken;

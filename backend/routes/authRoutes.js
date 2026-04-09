const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const authController = require("../controllers/authController");

// Register Route with Validation
router.post(
  "/register",
  [
    body("email", "Please provide a valid email").isEmail(),
    body("password", "Password must be at least 6 characters").isLength({ min: 6 }),
    body("name", "Name is required").not().isEmpty(),
  ],
  authController.register
);

// Login Route with Validation
router.post(
  "/login",
  [
    body("email", "Please provide a valid email").isEmail(),
    body("password", "Password is required").exists(),
  ],
  authController.login
);

module.exports = router;

const express = require('express');
const router = express.Router();

// Test route
router.get('/', (req, res) => {
  res.json({ message: 'Auth route working' });
});

// Register route
router.post('/register', (req, res) => {
  res.json({ message: 'Register endpoint' });
});

// Login route
router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint' });
});

module.exports = router;
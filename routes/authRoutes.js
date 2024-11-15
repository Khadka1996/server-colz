const express = require('express');
const { login, signup } = require('../controllers/authController');

const router = express.Router();

// POST /auth/signup
// Register a new user (could be SuperAdmin, Driver, or User)
router.post('/signup', signup);

// POST /auth/login
// Login for SuperAdmin, Driver, or User
router.post('/login', login);

module.exports = router;

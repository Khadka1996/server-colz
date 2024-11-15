const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth'); // Adjust the path as needed

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, authConfig.JWT_SECRET, { expiresIn: authConfig.JWT_EXPIRES_IN });
};

const verifyToken = (token) => {
  return jwt.verify(token, authConfig.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};

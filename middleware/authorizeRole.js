const roles = require('../config/roles');

const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(403).json({ message: 'Access denied, user not authenticated' });
    }

    // Check if user has one of the allowed roles
    const hasRole = allowedRoles.some(role => req.user.role === role);

    if (!hasRole) {
      return res.status(403).json({ message: 'Access denied, insufficient permissions' });
    }

    // If authentication and authorization succeed, proceed to the next middleware
    next();
  };
};

module.exports = authorizeRole;

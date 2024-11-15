const express = require('express');
const {
  manageDrivers,
  manageUsers,
  viewAnalytics,
  deleteUser,
  deleteDriver,
  updateUser,
  updateDriver,
  updateUserToDriver, // Add the new updateUserToDriver function
} = require('../controllers/adminController');
const authenticateUser = require('../middleware/authenticateUser');
const authorizeRole = require('../middleware/authorizeRole');
const roles = require('../config/roles');

const router = express.Router();

// GET /admin/drivers
// SuperAdmin can view and manage drivers
router.get('/drivers', authenticateUser, authorizeRole([roles.SUPER_ADMIN]), manageDrivers);

// GET /admin/users
// SuperAdmin can view all registered users
router.get('/users', authenticateUser, authorizeRole([roles.SUPER_ADMIN]), manageUsers);

// GET /admin/analytics
// SuperAdmin can view platform analytics
router.get('/analytics', authenticateUser, authorizeRole([roles.SUPER_ADMIN]), viewAnalytics);

// DELETE /admin/users/:userId
// SuperAdmin can delete a user by user ID
router.delete('/users/:userId', authenticateUser, authorizeRole([roles.SUPER_ADMIN]), deleteUser);

// DELETE /admin/drivers/:driverId
// SuperAdmin can delete a driver by driver ID
router.delete('/drivers/:driverId', authenticateUser, authorizeRole([roles.SUPER_ADMIN]), deleteDriver);

// PUT /admin/users/:userId
// SuperAdmin can update user information by user ID
router.put('/users/:userId', authenticateUser, authorizeRole([roles.SUPER_ADMIN]), updateUser);

// PUT /admin/drivers/:driverId
// SuperAdmin can update driver information by driver ID
router.put('/drivers/:driverId', authenticateUser, authorizeRole([roles.SUPER_ADMIN]), updateDriver);

// PUT /admin/users/:userId/convert-to-driver
// SuperAdmin can update user role to Driver by user ID
router.put('/users/:userId/convert-to-driver', authenticateUser, authorizeRole([roles.SUPER_ADMIN]), updateUserToDriver);

module.exports = router;

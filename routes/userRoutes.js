const express = require('express');
const {
  getUserProfile,
  findNearbyDriversForUser,
  bookRide,
  viewBookings,
  giveRating,
  getAllDrivers,
} = require('../controllers/userController');
const authenticateUser = require('../middleware/authenticateUser');
const authorizeRole = require('../middleware/authorizeRole');
const roles = require('../config/roles');

const router = express.Router();

// GET /user/profile - Get user profile details (for both Users and Drivers)
router.get('/profile', authenticateUser, authorizeRole([roles.USER, roles.DRIVER]), getUserProfile);

// GET /user/nearby-drivers/:vehicleType - Find nearby drivers for the authenticated user
router.get('/nearby-drivers/:vehicleType', authenticateUser, authorizeRole([roles.USER]), findNearbyDriversForUser);

// POST /user/book-ride - Users can book a ride
// router.post('/book-ride', authenticateUser, authorizeRole([roles.USER]), bookRide);
router.post('/book-ride/:id', authenticateUser, authorizeRole([roles.USER]), bookRide);

//POST /user/book-ride - Users can book a ride
router.get('/drivers', authenticateUser, authorizeRole([roles.USER]), getAllDrivers);
// GET /user/bookings - Users can view their booked rides
router.get('/bookings', authenticateUser, authorizeRole([roles.USER]), viewBookings);

// POST /user/give-rating - Users can give a rating for a ride
router.post('/give-rating', authenticateUser, authorizeRole([roles.USER]), giveRating);

module.exports = router;

const express = require('express');
const {
  viewAssignedRides,
  updateRideStatus,
  viewEarnings,
  cancelRide,
  acceptRide,
  checkRideStatus,
} = require('../controllers/driverController');
const authenticateUser = require('../middleware/authenticateUser');
const authorizeRole = require('../middleware/authorizeRole');
const roles = require('../config/roles');

const router = express.Router();

// GET /driver/ride-requests - Drivers can view their assigned rides
router.get('/ride-requests', viewAssignedRides);

// PUT /driver/ride-requests/:rideId/accept - Drivers can accept a ride
router.put('/ride-requests/:id/accept', acceptRide);

// PUT /driver/ride-requests/:rideId/cancel - Drivers can cancel a ride
router.put('/ride-requests/:rideId/cancel', cancelRide);

// PUT /driver/ride-requests/:rideId/status - Drivers can update the ride status
router.put('/ride-requests/:rideId/status', authenticateUser, authorizeRole([roles.DRIVER]), updateRideStatus);

// GET /driver/earnings - Drivers can view their earnings
router.get('/earnings', authenticateUser, authorizeRole([roles.DRIVER]), viewEarnings);

// GET /driver/check-ride-status/:driverId - Check ride status (for non-completed rides)
router.get('/check-ride-status/:driverId', authenticateUser, authorizeRole([roles.DRIVER]), checkRideStatus);

module.exports = router;

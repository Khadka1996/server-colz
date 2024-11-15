const RideRequest = require('../models/Ride');
const Driver = require('../models/Driver');
const { roles } = require('../config/roles');
const viewAssignedRides = async (req, res) => {
  try {
    // Replace with a valid driver ID from your database
    const driverId = '66ec47ade601740c7707ee51'; // Example ObjectId

    // Find ride requests assigned to the driver
    const assignedRides = await RideRequest.find({ driver: driverId })
      .populate('user', 'name')
      .populate('pickupLocation')
      .populate('dropOffLocation');

    if (!assignedRides.length) {
      return res.status(404).json({ message: 'No assigned rides found.' });
    }

    // Return the assigned rides
    res.status(200).json(assignedRides);
  } catch (error) {
    console.error('Error fetching assigned rides:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const acceptRide = async (req, res) => {
  const { id } = req.params; // Ride ID from params
  console.log('Ride ID from params:', id);

  if (!id) {
    return res.status(400).json({ error: 'Ride ID is required' });
  }

  try {
    const booking = await Booking.findById(id); // Use Booking model here
    if (!booking) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Ride is not pending' });
    }

    booking.status = 'accepted'; // Accept the ride
    await booking.save();

    res.status(200).json({ message: 'Ride accepted successfully', booking });
  } catch (error) {
    console.error('Error in acceptRide controller:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update Ride Status
const updateRideStatus = async (req, res) => {
  const { rideId } = req.params;
  const { status } = req.body;

  try {
    const ride = await RideRequest.findById(rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });

    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to update this ride' });
    }

    const validStatuses = ['accepted', 'in-progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status update' });
    }

    ride.status = status;
    await ride.save();

    if (status === 'completed') {
      await Driver.findByIdAndUpdate(req.user.id, { isAvailable: true });
    }

    res.status(200).json({ message: 'Ride status updated successfully', ride });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating ride status' });
  }
};

// View Earnings
const viewEarnings = async (req, res) => {
  const driverId = req.user.id;

  try {
    const completedRides = await RideRequest.find({ driver: driverId, status: 'completed' });
    const totalEarnings = completedRides.reduce((total, ride) => total + ride.fare, 0);

    res.status(200).json({ totalEarnings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving earnings' });
  }
};

// Cancel Ride
const cancelRide = async (req, res) => {
  const { rideId } = req.params;

  try {
    const ride = await RideRequest.findById(rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });

    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to cancel this ride' });
    }

    ride.status = 'cancelled';
    await ride.save();

    await Driver.findByIdAndUpdate(req.user.id, { isAvailable: true });

    res.status(200).json({ message: 'Ride cancelled successfully', ride });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error canceling ride' });
  }
};

// Check Ride Status
const checkRideStatus = async (req, res) => {
  const { driverId } = req.params;

  try {
    const rides = await RideRequest.find({ driver: driverId, status: { $ne: 'completed' } });

    if (!rides.length) {
      return res.status(404).json({ message: 'No active rides for this driver' });
    }

    res.status(200).json({ rides });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error checking ride status' });
  }
};

module.exports = {
  viewAssignedRides,
  acceptRide,
  updateRideStatus,
  viewEarnings,
  cancelRide,
  checkRideStatus,
};

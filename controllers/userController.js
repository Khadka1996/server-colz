const User = require('../models/User');
const Booking = require('../models/Ride');
const Driver = require('../models/Driver');
const { calculateDistance, findNearbyDrivers, toGeoJSON } = require('../utils/geolocation');

// Get User Profile
const getUserProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).select('name email location');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Find Nearby Drivers for a User
const findNearbyDriversForUser = async (req, res) => {
  const { vehicleType } = req.params;
  const { latitude, longitude } = req.query;

  // Validate that latitude and longitude are provided
  if (!latitude || !longitude) {
    return res.status(400).json({ message: 'Latitude and longitude are required.' });
  }

  // Ensure latitude and longitude are valid numbers
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  if (isNaN(lat) || isNaN(lon)) {
    return res.status(400).json({ message: 'Invalid latitude or longitude.' });
  }

  // User location for MongoDB GeoJSON
  const userLocation = {
    type: 'Point',
    coordinates: [lon, lat], // [longitude, latitude]
  };

  try {
    // Find nearby available drivers of the specified vehicle type within 5km
    const nearbyDrivers = await Driver.find({
      vehicleType,
      isAvailable: true,
      location: {
        $near: {
          $geometry: userLocation,
          $maxDistance: 5000, // 5km in meters
        },
      },
    }).select('name role location vehicleType'); // Select only necessary fields

    // If no drivers found, return an appropriate message
    if (nearbyDrivers.length === 0) {
      return res.status(404).json({ message: 'No nearby drivers found.' });
    }

    // Format the drivers to only send needed fields
    const formattedDrivers = nearbyDrivers.map(driver => ({
      name: driver.name,
      role: driver.role,
      vehicleType: driver.vehicleType,
    }));

    // Return the list of nearby drivers
    return res.status(200).json(formattedDrivers);
  } catch (error) {
    console.error('Error fetching nearby drivers:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};
const bookRide = async (req, res) => {
  try {
    const { user, driver, fare, pickupLocation, dropOffLocation, message } = req.body;

    // Create a new booking instance
    const booking = new Booking({
      user,
      driver,
      fare,
      pickupLocation,
      dropOffLocation,
      message,
    });

    // Save the booking to the database
    await booking.save();

    // Notify the driver about the new booking
    notifyDriver(driver, message);

    return res.status(201).json(booking);
  } catch (error) {
    console.error('Error booking ride:', error);
    return res.status(400).json({ message: 'Error booking ride', error });
  }
};

// Notify the driver (you can implement this function according to your needs)
const notifyDriver = (driverId, message) => {
  // Logic to notify the driver (e.g., via WebSocket, push notification, etc.)
  console.log(`Notifying driver ${driverId}: ${message}`);
};



// Driver accepts the ride
const acceptRide = async (req, res) => {
  const { rideId } = req.body;
  const driverId = req.user.id;

  try {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Ensure ride is in 'Pending' state
    if (ride.status !== 'Pending') {
      return res.status(400).json({ message: 'Ride is not available for acceptance' });
    }

    // Assign driver and update status to 'Accepted'
    ride.driver = driverId;
    ride.status = 'Accepted';

    await ride.save();
    res.status(200).json({ message: 'Ride accepted successfully', ride });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Driver starts the ride after acceptance
const startRide = async (req, res) => {
  const { rideId } = req.body;
  const driverId = req.user.id;

  try {
    const ride = await Ride.findById(rideId);
    if (!ride || ride.driver.toString() !== driverId) {
      return res.status(404).json({ message: 'Ride not found or not assigned to you' });
    }

    if (ride.status !== 'Accepted') {
      return res.status(400).json({ message: 'Ride is not in an accepted state' });
    }

    ride.status = 'InProgress';

    await ride.save();
    res.status(200).json({ message: 'Ride started', ride });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Driver completes the ride
const completeRide = async (req, res) => {
  const { rideId } = req.body;
  const driverId = req.user.id;

  try {
    const ride = await Ride.findById(rideId);
    if (!ride || ride.driver.toString() !== driverId) {
      return res.status(404).json({ message: 'Ride not found or not assigned to you' });
    }

    if (ride.status !== 'InProgress') {
      return res.status(400).json({ message: 'Ride is not in progress' });
    }

    ride.status = 'Completed';

    await ride.save();
    res.status(200).json({ message: 'Ride completed successfully', ride });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Give Rating
const giveRating = async (req, res) => {
  const { rideId, rating } = req.body;

  // Validate rating (optional, you can enforce rules like a 1-5 scale)
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating should be between 1 and 5' });
  }

  try {
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });

    ride.rating = rating;
    await ride.save();

    res.json({ message: 'Rating submitted successfully', ride });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
const viewBookings = async (req, res) => {
  const userId = req.user.id;

  try {
    const bookings = await Ride.find({ user: userId });
    if (!bookings.length) {
      return res.status(404).json({ message: 'No bookings found' });
    }
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().select('name vehicleType location isAvailable');
    return res.status(200).json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return res.status(500).json({ message: 'Server error while fetching drivers.' });
  }
};


module.exports = {
  getUserProfile,
  findNearbyDriversForUser,
  bookRide,
  acceptRide,
  startRide,
  completeRide,
  viewBookings, 
  giveRating,
  getAllDrivers,
};

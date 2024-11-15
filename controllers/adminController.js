const User = require('../models/User');
const Driver = require('../models/Driver'); // Assuming you have a Driver model
const Ride = require('../models/Ride'); // Ride model for ride management

// Manage Drivers
const manageDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find(); // Fetch drivers from the Driver model
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
// Update Driver Information
const updateDriver = async (req, res) => {
  const { userId } = req.params; // Get user ID from request parameters
  const { role, vehicle, vehicleType, location } = req.body; // Include vehicle and location

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update user role
    user.role = role;
    await user.save();

    // If the role is Driver, create a Driver document
    if (role === 'Driver') {
      const driverData = {
        name: user.name,
        vehicle,
        vehicleType,
        location,
        // Add any additional data you want to include
      };

      const driver = new Driver(driverData);
      await driver.save();

      // Optionally, you can link the user to the driver
      user.driverDetails = driver._id;
      await user.save();
    }

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Manage Users
const manageUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'User' });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update User to Driver
const updateUserToDriver = async (req, res) => {
  const { userId } = req.params; // User ID from the request parameters
  const { vehicle, vehicleType, location } = req.body; // Vehicle data to create a driver record

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a new driver record
    const newDriver = new Driver({
      name: user.name,
      email: user.email,
      role: 'Driver',
      location: {
        type: 'Point',
        coordinates: [85.324, 27.7172], // Should be passed in as [longitude, latitude]
      },
      vehicle: 'Bike',
      vehicleType: 'Bike',
    });

    // Save the driver record
    const savedDriver = await newDriver.save();

    // Update the user's role and link to the driver
    user.role = 'Driver';
    user.driverDetails = savedDriver._id; // Reference to the Driver model
    await user.save();

    res.status(200).json({ message: 'User updated to driver successfully', driver: savedDriver });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user to driver' });
  }
};

// View Analytics
const viewAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDrivers = await Driver.countDocuments();
    const totalRides = await Ride.countDocuments();

    // Assuming rides have a 'price' field for earnings calculation
    const totalEarnings = await Ride.aggregate([
      { $group: { _id: null, total: { $sum: "$price" } } }
    ]);

    res.json({
      totalUsers,
      totalDrivers,
      totalRides,
      totalEarnings: totalEarnings[0] ? totalEarnings[0].total : 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  const { userId } = req.params; // Assuming user ID is sent in the request parameters

  try {
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete Driver
const deleteDriver = async (req, res) => {
  const { driverId } = req.params; // Assuming driver ID is sent in the request parameters

  try {
    await Driver.findByIdAndDelete(driverId);
    res.status(200).json({ message: 'Driver deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update User Information
const updateUser = async (req, res) => {
  const { userId } = req.params; // User ID from the request parameters
  const updates = req.body; // The fields to update

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  manageDrivers,
  manageUsers,
  viewAnalytics,
  deleteUser,
  deleteDriver,
  updateUser,
  updateDriver,
  updateUserToDriver,
};

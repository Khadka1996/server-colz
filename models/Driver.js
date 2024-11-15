const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { 
    type: String, 
    enum: ['Driver', 'Admin', 'User'],
    required: true 
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point', // Default type for geospatial
    },
    coordinates: {
      type: [Number],
      required: true,
      default: [85.324, 27.7172], // Default coordinates for Kathmandu (longitude, latitude)
    },
  },
  vehicle: {
    type: String, // e.g., car model
    required: true,
  },
  vehicleType: {
    type: String,
    enum: ['Bike', 'Taxi', 'Truck'],
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
});

// Create a geospatial index on the location field
driverSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Driver', driverSchema);

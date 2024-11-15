const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true, // Ensure that the email is indexed for uniqueness
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['SuperAdmin', 'Driver', 'User'],
    default: 'User',
  },
  driverDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null, // Default is null, and it will be filled when user becomes a Driver
  },
  location: {
    type: {
      type: String, // GeoJSON Type (Point in this case)
      enum: ['Point'], 
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [85.324, 27.7172], // Default location coordinates for Kathmandu
      index: '2dsphere', // Index for geospatial queries
    },
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

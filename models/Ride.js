const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema for the booking
const bookingSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true,
  },
  fare: {
    type: Number,
    required: true,
  },
  pickupLocation: {
    type: {
      type: String, // GeoJSON type, e.g., 'Point'
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number], // Array of numbers for longitude and latitude
      required: true,
    },
  },
  dropOffLocation: {
    type: {
      type: String, // GeoJSON type, e.g., 'Point'
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number], // Array of numbers for longitude and latitude
      required: true,
    },
  },
  message: {
    type: String,
    default: '', // Message from user to driver (optional)
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'cancelled'],
    default: 'pending', // Default booking status is 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically sets the creation date
  }
});

// Create a 2dsphere index for geospatial queries (needed for location-based searches)
bookingSchema.index({ pickupLocation: '2dsphere', dropOffLocation: '2dsphere' });

// Export the Booking model
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;

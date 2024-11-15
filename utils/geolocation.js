const haversine = require('haversine'); // You may need to install this library using `npm install haversine`
const Driver = require('../models/Driver'); // Adjust the path as necessary

// Function to calculate distance between two points
const calculateDistance = (pointA, pointB, unit = 'km') => {
  const start = { latitude: pointA.latitude, longitude: pointA.longitude };
  const end = { latitude: pointB.latitude, longitude: pointB.longitude };

  // Log coordinates to ensure they are passed correctly
  console.log('User Coordinates:', start);
  console.log('Driver Coordinates:', end);

  const distance = haversine(start, end, { unit });

  // Log the calculated distance for debugging
  console.log(`Calculated Distance: ${distance} ${unit}`);

  return distance;
};

// Function to find nearby drivers based on user location
const findNearbyDrivers = async (userLocation, maxDistance) => {
  // Log the user location and max distance before querying
  console.log('User Location (GeoJSON):', userLocation);
  console.log('Max Distance:', maxDistance);

  const drivers = await Driver.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: userLocation.coordinates,
        },
        $maxDistance: maxDistance, // in meters
      },
    },
  });

  // Log the found drivers for verification
  console.log('Nearby Drivers:', drivers);

  return drivers;
};

// Example function to convert location object to GeoJSON
const toGeoJSON = (latitude, longitude) => {
  const geoJSON = {
    type: 'Point',
    coordinates: [longitude, latitude], // [longitude, latitude] format
  };

  // Log the GeoJSON format for debugging
  console.log('Converted GeoJSON:', geoJSON);

  return geoJSON;
};

module.exports = {
  calculateDistance,
  findNearbyDrivers,
  toGeoJSON, // Exporting toGeoJSON function if needed
};

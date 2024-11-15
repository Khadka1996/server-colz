const authConfig = {
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key',
    JWT_EXPIRES_IN: '1h', // Example expiration time
  };
  
  module.exports = authConfig;
  
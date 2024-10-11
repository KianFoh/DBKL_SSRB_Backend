require('dotenv').config();

module.exports = {
  imageQuality: parseInt(process.env.IMAGE_QUALITY, 10) || 40,
  locationThreshold: parseInt(process.env.LOCATION_THRESHOLD, 10) || 1000,
  apiUrl: process.env.API_URL || "http://localhost:5001",
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  allowedOrigin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000'
};
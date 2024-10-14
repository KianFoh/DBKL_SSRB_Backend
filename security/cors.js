const cors = require('cors');
const { allowedOrigins } = require('../config');

// CORS configuration to allow specific domains
const corsOptions = {
  origin: (origin, callback) => {
    if (origin && allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: '*',
};

// Middleware to check the origin of the request
const checkOrigin = (req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Access is denied' });
  }
};

module.exports = {
  cors,
  corsOptions,
  checkOrigin,
};
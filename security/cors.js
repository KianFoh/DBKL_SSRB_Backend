const cors = require('cors');
const { allowedOrigin } = require('../config');

// CORS configuration to allow only a specific domain
const corsOptions = {
  origin: allowedOrigin,
  methods: '*',
};

// Middleware to check the origin of the request
const checkOrigin = (req, res, next) => {
  const allowedOrigins = [allowedOrigin];
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
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
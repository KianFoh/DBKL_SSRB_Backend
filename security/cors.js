const cors = require('cors');
const { allowedOrigins } = require('../config');

// CORS configuration to allow specific domains
const corsOptions = {
  origin: (origin, callback) => {
    if (origin && allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Forbidden Access'));
    }
  },
  methods: '*',
};

module.exports = {
  cors,
  corsOptions,
};
// Import necessary modules and configurations
const express = require('express');
const db = require('./models');
const { upload, tempUpload } = require('./middleware/upload');
const { createTenant, verifyTenant } = require('./controllers/tenantController');
const { port, host } = require('./config');
const { cors, corsOptions, checkOrigin } = require('./security/cors');

// Initialize the Express application
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// *** Security configurations ***//

// Enable CORS with custom options
app.use(cors(corsOptions));

// Error handling for CORS
app.use((err, req, res, next) => {
  if (err.message === 'Forbidden Access') {
    res.status(403).json({ message: err.message });
  } else {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// *** API Routes ***//

// Route to create a new tenant
app.post('/tenant', upload.single('Selfie'), createTenant);

// Route to verify a tenant with image and location
app.post('/tenant/verify', tempUpload.single('Selfie'), verifyTenant);

// Initialize the database and start the server
(async () => {
  try {
    await db.initializeDatabase();
    app.listen(port, host, () => {
      console.log(`DBKL API app listening at http://${host}:${port}`);
    });
  } catch (error) {
    console.error('Failed to initialize database and start server:', error);
  }
})();
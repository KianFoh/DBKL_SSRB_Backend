// Import necessary modules and configurations
const express = require('express');
const db = require('./models');
const { upload, tempUpload } = require('./middleware/upload');
const { createTenant, verifyTenant } = require('./controllers/tenantController');
const { port, host } = require('./config');

// Initialize the Express application
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Route to create a new tenant with image upload
app.post('/tenant', upload.single('Selfie'), createTenant);

// Route to verify a tenant with temporary image upload
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
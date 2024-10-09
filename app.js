const express = require('express');
const db = require('./models'); // Ensure this path is correct
const multer = require('multer');
const app = express();

const port = process.env.PORT || 3000;

// Middleware to handle JSON bodies
app.use(express.json());

// Middleware to handle file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Define the POST route
app.post('/tenant', upload.single('Selfie'), async (req, res) => {
  try {
    // Accessing the data from req.body
    const { IC, Location, Name } = req.body;

    // Accessing the image file from req.file
    const image = req.file;

    // Log the received data
    console.log('Name:', Name);
    console.log('IC:', IC);
    console.log('Location:', Location);
    console.log('Selfie:', image);

    // Parse the location data (assuming it's in "latitude,longitude" format)
    const [latitude, longitude] = Location.split(',').map(Number);

    // Save the data to the database
    const newTenant = await db.models.Tenant.create({
      name: Name,
      IC: IC,
      image: image.buffer, // Store the image as a BLOB
      location: { type: 'Point', coordinates: [longitude, latitude] } // Store the location as a POINT
    });

    // Query the database for the newly inserted tenant
    const insertedTenant = await db.models.Tenant.findOne({ where: { IC: IC } });

    // Log the inserted tenant
    console.log('Inserted Tenant:', insertedTenant);

    // Respond with a success message
    res.status(200).json({ message: 'Data received and stored successfully', tenant: insertedTenant });
  } 
  catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Define the POST route
app.post('/tenant/verify', upload.single('Selfie'), async (req, res) => {
  try {
    // Accessing the data from req.body
    const { IC, location } = req.body;

    // Accessing the image file from req.file
    const image = req.file;

    // Log the received data
    console.log('IC:', IC);
    console.log('Location:', location);
    console.log('Selfie:', image);

    // Respond with a success message
    res.status(200).json({ message: 'Data received successfully' });
  } 
  catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

(async () => {
  try {
    await db.initializeDatabase();
    // Start the server and listen on the specified port
    app.listen(port, () => {
      console.log(`DBKL API app listening at http://0.0.0.0:${port}`);
    });
  } 
  catch (error) {
    console.error('Failed to initialize database and start server:', error);
  }
})();
require('dotenv').config();

const express = require('express');
const db = require('./models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const app = express();

// Load environment variables
const image_quality = process.env.IMAGE_QUALITY || 40; // Default to 70 if not set
const location_threshold = process.env.LOCATION_THRESHOLD || 1000; // Default to 1000 meters if not set
const port = process.env.PORT || 3000;

// Middleware to handle JSON bodies
app.use(express.json());

// Middleware to handle file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'Image', 'tenants', 'Images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const { IC } = req.body;
    if (!IC) {
      return cb(new Error('IC is required'), false);
    }
    cb(null, `${IC}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage: storage });

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

    // Ensure the compressed directory exists
    const compressedDir = path.join(__dirname, 'Image', 'tenants', 'Compressed');
    if (!fs.existsSync(compressedDir)) {
      fs.mkdirSync(compressedDir, { recursive: true });
    }

    // Compress the image using sharp
    const compressedImagePath = path.join(__dirname, 'Image', 'tenants', 'Compressed', image.filename);
    await sharp(image.path)
    .jpeg({ quality: image_quality }) // Adjust the quality to reduce the file size
    .toFile(compressedImagePath);

    // Save the data to the database
    const newTenant = await db.models.Tenant.create({
      name: Name,
      IC: IC,
      image: image.path, // Store the image path
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

// Define the POST route for verification
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

    // Parse the location data (assuming it's in "latitude,longitude" format)
    const [latitude, longitude] = location.split(',').map(Number);

    // Query the database for the tenant
    const tenant = await db.models.Tenant.findOne({ where: { IC: IC } });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Calculate the distance between the two locations
    const distance = geolib.getDistance(
      { latitude: tenant.location.coordinates[1], longitude: tenant.location.coordinates[0] },
      { latitude: latitude, longitude: longitude }
    );

    // Determine if the locations are within the threshold
    const isWithinThreshold = distance <= location_threshold;

    // Respond with the result
    res.status(200).json({ message: 'Verification complete', isWithinThreshold, distance });
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
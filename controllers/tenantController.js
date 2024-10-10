const db = require('../models');
const geolib = require('geolib');
const axios = require('axios');
const fs = require('fs');
const { compressImage } = require('../utils/imageUtils');
const { imageQuality, locationThreshold, apiUrl } = require('../config');

// Controller function to create a new tenant
const createTenant = async (req, res) => {
  try {
    const { IC, Location, Name } = req.body;
    const image = req.file;

    console.log('Name:', Name);
    console.log('IC:', IC);
    console.log('Location:', Location);
    console.log('Selfie:', image);

    // Extract latitude and longitude from Location
    const [latitude, longitude] = Location.split(',').map(Number);

    // Compress the uploaded image
    const compressedImagePath = await compressImage(image.path, imageQuality);

    // Rename the compressed image to the original image path
    fs.renameSync(compressedImagePath, image.path);

    // Create a new tenant record in the database
    const newTenant = await db.models.Tenant.create({
      name: Name,
      IC: IC,
      image: image.path,
      location: { type: 'Point', coordinates: [longitude, latitude] }
    });
    
    // Send a success response
    res.status(200).json({ message: 'Data received and stored successfully' });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controller function to verify a tenant
const verifyTenant = async (req, res) => {
  try {
    const { IC, Location } = req.body;
    const image = req.file;

    // Extract latitude and longitude from Location
    const [latitude, longitude] = Location.split(',').map(Number);

    // Find the tenant by IC
    const tenant = await db.models.Tenant.findOne({ where: { IC: IC } });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Calculate the distance between the tenant's location and the provided location
    const distance = geolib.getDistance(
      { latitude: tenant.location.coordinates[1], longitude: tenant.location.coordinates[0] },
      { latitude: latitude, longitude: longitude }
    );

    const isWithinThreshold = distance <= locationThreshold;
    console.log('Distance:', isWithinThreshold);

    // Compress the uploaded image
    const compressedImagePath = await compressImage(image.path, imageQuality);

    // Rename the compressed image to the original image path
    fs.renameSync(compressedImagePath, image.path);

    try {
      // Call the external API to verify the tenant's image
      const apiResponse = await axios.post(`${apiUrl}/verify`, {
        img1_path: tenant.image,
        img2_path: image.path
      });

      console.log('API Response:', apiResponse.data);

      // Send a success response
      res.status(200).json({ message: 'Verification complete', isWithinThreshold, distance, apiResponse: apiResponse.data });
    } catch (error) {
      // Handle specific error e.g. when face is not detected
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data.error || error.response.data.message || 'Bad Request';
        if (errorMessage.includes('Face could not be detected')) {
          console.error('Face not detected in the image:', errorMessage);
          res.status(400).json({ message: 'Face not detected in the image. Please provide a clear face photo.' });
        } 
        // Handle other errors from the external API Call
        else {
          console.error('Error calling external API:', errorMessage);
          res.status(400).json({ message: 'Error calling external API', error: errorMessage });
        }
      } else {
        // Handle other 500 errors meaning the external API has internal issues
        console.error('Error calling external API:', error);
        res.status(500).json({ message: 'Error calling external API', error: error.message });
      }
    } finally {
        // Ensure the temporary image file is deleted
        fs.unlink(image.path, (err) => {
          if (err) {
            console.error('Error deleting the file:', err);
          } else {
            console.log('Temporary file deleted successfully');
          }
        });
      }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { createTenant, verifyTenant };
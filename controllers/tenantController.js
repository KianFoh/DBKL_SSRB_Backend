const db = require('../models');
const { getDistance } = require('../utils/locationUtils');
const { compressImage, deleteFile } = require('../utils/imageUtils');
const { callExternalApi } = require('../utils/apiUtils');
const { imageQuality, locationThreshold } = require('../config');
const fs = require('fs'); // Ensure fs is imported
const { log } = require('console');

// Controller function to create a new tenant
const createTenant = async (req, res) => {
  try {
    const { IC, Location, Name } = req.body;
    const image = req.file;

    console.log('Name:', Name);
    console.log('IC:', IC);
    console.log('Location:', Location);
    console.log('Selfie:', image);

    const [latitude, longitude] = Location.split(',').map(Number);

    const compressedImagePath = await compressImage(image.path, imageQuality);
    fs.renameSync(compressedImagePath, image.path);

    const newTenant = await db.models.Tenant.create({
      name: Name,
      IC: IC,
      image: image.path,
      location: { type: 'Point', coordinates: [longitude, latitude] }
    });

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
    const [latitude, longitude] = Location.split(',').map(Number);

    const tenant = await db.models.Tenant.findOne({ where: { IC: IC } });
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const distance = getDistance(tenant.location.coordinates, [longitude, latitude]);
    const isWithinThreshold = distance <= locationThreshold;
    console.log('Distance:', distance, locationThreshold, isWithinThreshold);

    const compressedImagePath = await compressImage(image.path, imageQuality);
    fs.renameSync(compressedImagePath, image.path);

    try {
      const apiResponse = await callExternalApi(tenant.image, image.path);
      const selfieResult = apiResponse.data.verified;
      console.log('Selfie Result:', selfieResult, apiResponse.data.threshold, apiResponse.data.distance);
      console.log('isWithinThreshold:', isWithinThreshold);
      tenant.status = !selfieResult || !isWithinThreshold ? 'Yellow' : 'Green';
      await tenant.save();

      console.log('API Response:', selfieResult);
      res.status(200).json({ 
        message: `Verification completed. Tenant Name: ${tenant.name}, IC: ${tenant.IC}, Status: ${tenant.status}, Location Match: ${isWithinThreshold}, Selfie Match: ${selfieResult}`
      });
    } catch (error) {
      handleApiError(error, tenant, res);
    } finally {
      deleteFile(image.path);
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const handleApiError = (error, tenant, res) => {
  const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Bad Request';
  if (error.response?.status === 400) {
    if (errorMessage.includes('Face could not be detected')) {
      tenant.status = 'Red';
      tenant.save();
      console.error('Face not detected in the image:', errorMessage);
      res.status(400).json({ message: 'Face not detected in the image. Please provide a clear face photo.' });
    } else {
      console.error('Error calling external API:', errorMessage);
      res.status(400).json({ message: 'Error calling external API', error: errorMessage });
    }
  } else {
    console.error('Error calling external API:', error);
    res.status(500).json({ message: 'Error calling external API', error: error.message });
  }
};

module.exports = { createTenant, verifyTenant };
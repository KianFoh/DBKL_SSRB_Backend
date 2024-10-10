const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const compressImage = async (imagePath, quality) => {
  const compressedImagePath = path.join(path.dirname(imagePath), path.basename(imagePath, path.extname(imagePath)) + '_compressed.jpg');
  await sharp(imagePath)
    .jpeg({ quality: quality })
    .toFile(compressedImagePath);
  return compressedImagePath;
};

const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting the file:', err);
    } else {
      console.log('Temporary file deleted successfully');
    }
  });
};

module.exports = { compressImage, deleteFile };
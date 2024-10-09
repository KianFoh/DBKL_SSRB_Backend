const sharp = require('sharp');
const path = require('path');

const compressImage = async (imagePath, quality) => {
  const compressedImagePath = path.join(path.dirname(imagePath), path.basename(imagePath, path.extname(imagePath)) + '_compressed.jpg');
  await sharp(imagePath)
    .jpeg({ quality: quality })
    .toFile(compressedImagePath);
  return compressedImagePath;
};

module.exports = { compressImage };
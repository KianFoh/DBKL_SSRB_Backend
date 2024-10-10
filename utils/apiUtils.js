const axios = require('axios');
const { apiUrl } = require('../config');

const callExternalApi = (img1Path, img2Path) => {
  return axios.post(`${apiUrl}/verify`, {
    img1_path: img1Path,
    img2_path: img2Path
  });
};

module.exports = { callExternalApi };
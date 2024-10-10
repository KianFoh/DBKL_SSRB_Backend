const geolib = require('geolib');

const getDistance = (coordinates1, coordinates2) => {
  return geolib.getDistance(
    { latitude: coordinates1[1], longitude: coordinates1[0] },
    { latitude: coordinates2[1], longitude: coordinates2[0] }
  );
};

module.exports = { getDistance };
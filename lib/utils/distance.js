/**
 * Distance Calculation Utilities
 * Various distance calculation methods for DIGIPIN coordinates
 */

const { EARTH_RADIUS } = require('../core/constants');
const { decode } = require('../core/decoder');

/**
 * Convert degrees to radians
 * @param {number} degrees - Degrees
 * @returns {number} Radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 * @param {number} radians - Radians
 * @returns {number} Degrees
 */
function toDegrees(radians) {
  return radians * (180 / Math.PI);
}

/**
 * Calculate Haversine distance between two points
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} Distance in meters
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS * c;
}

/**
 * Calculate distance between two DIGIPINs
 * @param {string} digipin1 - First DIGIPIN
 * @param {string} digipin2 - Second DIGIPIN
 * @returns {number} Distance in meters
 */
function digipinDistance(digipin1, digipin2) {
  const coord1 = decode(digipin1);
  const coord2 = decode(digipin2);
  
  return haversineDistance(
    coord1.latitude, coord1.longitude,
    coord2.latitude, coord2.longitude
  );
}

/**
 * Calculate bearing between two points
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} Bearing in degrees (0-360)
 */
function bearing(lat1, lon1, lat2, lon2) {
  const dLon = toRadians(lon2 - lon1);
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);
  
  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  
  const bearingRad = Math.atan2(y, x);
  return (toDegrees(bearingRad) + 360) % 360;
}

/**
 * Calculate bearing between two DIGIPINs
 * @param {string} digipin1 - First DIGIPIN
 * @param {string} digipin2 - Second DIGIPIN
 * @returns {number} Bearing in degrees
 */
function digipinBearing(digipin1, digipin2) {
  const coord1 = decode(digipin1);
  const coord2 = decode(digipin2);
  
  return bearing(
    coord1.latitude, coord1.longitude,
    coord2.latitude, coord2.longitude
  );
}

/**
 * Calculate midpoint between two coordinates
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {Object} Midpoint coordinates
 */
function midpoint(lat1, lon1, lat2, lon2) {
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);
  const dLon = toRadians(lon2 - lon1);
  
  const bx = Math.cos(lat2Rad) * Math.cos(dLon);
  const by = Math.cos(lat2Rad) * Math.sin(dLon);
  
  const lat3Rad = Math.atan2(
    Math.sin(lat1Rad) + Math.sin(lat2Rad),
    Math.sqrt((Math.cos(lat1Rad) + bx) * (Math.cos(lat1Rad) + bx) + by * by)
  );
  
  const lon3Rad = toRadians(lon1) + Math.atan2(by, Math.cos(lat1Rad) + bx);
  
  return {
    latitude: toDegrees(lat3Rad),
    longitude: toDegrees(lon3Rad)
  };
}

/**
 * Calculate midpoint between two DIGIPINs
 * @param {string} digipin1 - First DIGIPIN
 * @param {string} digipin2 - Second DIGIPIN
 * @returns {Object} Midpoint coordinates
 */
function digipinMidpoint(digipin1, digipin2) {
  const coord1 = decode(digipin1);
  const coord2 = decode(digipin2);
  
  return midpoint(
    coord1.latitude, coord1.longitude,
    coord2.latitude, coord2.longitude
  );
}

/**
 * Check if a point is within a given radius of another point
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @param {number} radius - Radius in meters
 * @returns {boolean} True if within radius
 */
function isWithinRadius(lat1, lon1, lat2, lon2, radius) {
  return haversineDistance(lat1, lon1, lat2, lon2) <= radius;
}

/**
 * Check if a DIGIPIN is within radius of coordinates
 * @param {string} digipin - DIGIPIN to check
 * @param {number} lat - Center latitude
 * @param {number} lon - Center longitude
 * @param {number} radius - Radius in meters
 * @returns {boolean} True if within radius
 */
function digipinWithinRadius(digipin, lat, lon, radius) {
  const coord = decode(digipin);
  return isWithinRadius(coord.latitude, coord.longitude, lat, lon, radius);
}

/**
 * Get the closest DIGIPINs to a given point
 * @param {Array<string>} digipins - Array of DIGIPINs
 * @param {number} lat - Target latitude
 * @param {number} lon - Target longitude
 * @param {number} count - Number of closest DIGIPINs to return
 * @returns {Array<Object>} Sorted array of closest DIGIPINs with distances
 */
function getClosest(digipins, lat, lon, count = 5) {
  const distances = digipins.map(digipin => {
    const coord = decode(digipin);
    const distance = haversineDistance(lat, lon, coord.latitude, coord.longitude);
    return { digipin, distance, coordinates: coord };
  });
  
  return distances
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count);
}

module.exports = {
  haversineDistance,
  digipinDistance,
  bearing,
  digipinBearing,
  midpoint,
  digipinMidpoint,
  isWithinRadius,
  digipinWithinRadius,
  getClosest,
  toRadians,
  toDegrees
};
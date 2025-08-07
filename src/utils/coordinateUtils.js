/**
 * Coordinate Utilities for DIGIPIN API
 * Supports parsing of various coordinate formats:
 * - Decimal degrees (Google Maps format)
 * - Degrees Minutes Seconds (DMS) format
 */

/**
 * Parse DMS (Degrees Minutes Seconds) format to decimal degrees
 * Supports formats like: 12°54'10.3"N, 77°36'22.3"E
 * @param {string} dmsString - DMS coordinate string
 * @returns {number} - Decimal degrees
 */
function parseDMS(dmsString) {
  if (!dmsString || typeof dmsString !== 'string') {
    throw new Error('Invalid DMS string provided');
  }

  const normalized = dmsString.trim().replace(/\s+/g, ' ');
  
  // Regex to match DMS format: degrees°minutes'seconds"direction
  const dmsRegex = /^(\d+)°\s*(\d+)'\s*(\d+(?:\.\d+)?)"\s*([NSEW])$/i;
  const match = normalized.match(dmsRegex);
  
  if (!match) {
    throw new Error('Invalid DMS format. Expected format: 12°54\'10.3"N');
  }
  
  const [, degrees, minutes, seconds, direction] = match;
  
  let decimal = parseFloat(degrees) + parseFloat(minutes) / 60 + parseFloat(seconds) / 3600;
  
  // Apply direction (negative for South and West)
  if (direction.toUpperCase() === 'S' || direction.toUpperCase() === 'W') {
    decimal = -decimal;
  }
  
  return decimal;
}

/**
 * Parse coordinate string that could be in various formats
 * @param {string} coordString - Coordinate string
 * @returns {number} - Decimal degrees
 */
function parseCoordinate(coordString) {
  if (typeof coordString === 'number') {
    return coordString;
  }
  
  if (typeof coordString !== 'string') {
    throw new Error('Coordinate must be a number or string');
  }
  
  // Check if it's DMS format (contains degree symbol)
  if (coordString.includes('°')) {
    return parseDMS(coordString);
  }
  
  // Try to parse as decimal
  const decimal = parseFloat(coordString);
  if (isNaN(decimal)) {
    throw new Error('Invalid coordinate format');
  }
  
  return decimal;
}

/**
 * Parse coordinate pair from various formats
 * @param {string|number} lat - Latitude (decimal, DMS, or Google Maps format)
 * @param {string|number} lng - Longitude (decimal, DMS, or Google Maps format)
 * @returns {object} - {latitude: number, longitude: number}
 */
function parseCoordinatePair(lat, lng) {
  try {
    const latitude = parseCoordinate(lat);
    const longitude = parseCoordinate(lng);
    
    return { latitude, longitude };
  } catch (error) {
    throw new Error(`Coordinate parsing error: ${error.message}`);
  }
}

/**
 * Parse Google Maps coordinate string format
 * Supports formats like: "12.903016468272682, 77.60606960542954"
 * @param {string} coordString - Google Maps coordinate string
 * @returns {object} - {latitude: number, longitude: number}
 */
function parseGoogleMapsCoords(coordString) {
  if (!coordString || typeof coordString !== 'string') {
    throw new Error('Invalid Google Maps coordinate string');
  }
  
  const parts = coordString.split(',').map(part => part.trim());
  
  if (parts.length !== 2) {
    throw new Error('Google Maps format should contain exactly two coordinates separated by comma');
  }
  
  const latitude = parseFloat(parts[0]);
  const longitude = parseFloat(parts[1]);
  
  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Invalid numeric values in Google Maps coordinate string');
  }
  
  return { latitude, longitude };
}

/**
 * Validate coordinate values are within valid ranges
 * @param {number} latitude - Latitude in decimal degrees
 * @param {number} longitude - Longitude in decimal degrees
 * @returns {boolean} - True if valid
 */
function validateCoordinates(latitude, longitude) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    throw new Error('Coordinates must be numbers');
  }
  
  if (latitude < -90 || latitude > 90) {
    throw new Error('Latitude must be between -90 and 90 degrees');
  }
  
  if (longitude < -180 || longitude > 180) {
    throw new Error('Longitude must be between -180 and 180 degrees');
  }
  
  return true;
}

module.exports = {
  parseDMS,
  parseCoordinate,
  parseCoordinatePair,
  parseGoogleMapsCoords,
  validateCoordinates
};
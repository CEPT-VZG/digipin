/**
 * Enhanced DIGIPIN Decoder
 * Advanced decoding functionality with detailed error handling and batch operations
 */

const { DIGIPIN_GRID, BOUNDS, CHAR_TO_POSITION } = require('./constants');

/**
 * Decode a DIGIPIN to coordinates
 * @param {string} digiPin - DIGIPIN code to decode
 * @returns {Object} Decoded coordinates with metadata
 */
function decode(digiPin) {
  if (typeof digiPin !== 'string') {
    throw new Error('DIGIPIN must be a string');
  }

  const pin = digiPin.replace(/-/g, '').toUpperCase();
  
  if (pin.length === 0 || pin.length > 10) {
    throw new Error(`Invalid DIGIPIN length: ${pin.length}. Must be 1-10 characters.`);
  }

  let minLat = BOUNDS.minLat;
  let maxLat = BOUNDS.maxLat;
  let minLon = BOUNDS.minLon;
  let maxLon = BOUNDS.maxLon;

  for (let i = 0; i < pin.length; i++) {
    const char = pin[i];
    
    if (!CHAR_TO_POSITION[char]) {
      throw new Error(`Invalid character '${char}' at position ${i + 1}. Valid characters: ${Object.keys(CHAR_TO_POSITION).join(', ')}`);
    }

    const { row: ri, col: ci } = CHAR_TO_POSITION[char];

    const latDiv = (maxLat - minLat) / 4;
    const lonDiv = (maxLon - minLon) / 4;

    const lat1 = maxLat - latDiv * (ri + 1);
    const lat2 = maxLat - latDiv * ri;
    const lon1 = minLon + lonDiv * ci;
    const lon2 = minLon + lonDiv * (ci + 1);

    // Update bounds for next iteration
    minLat = lat1;
    maxLat = lat2;
    minLon = lon1;
    maxLon = lon2;
  }

  const centerLat = (minLat + maxLat) / 2;
  const centerLon = (minLon + maxLon) / 2;

  return {
    latitude: centerLat,
    longitude: centerLon,
    precision: pin.length,
    bounds: {
      north: maxLat,
      south: minLat,
      east: maxLon,
      west: minLon
    },
    accuracy: {
      latDegrees: maxLat - minLat,
      lonDegrees: maxLon - minLon,
      approximateMeters: Math.max(
        (maxLat - minLat) * 111000, // ~111km per degree latitude
        (maxLon - minLon) * 111000 * Math.cos(centerLat * Math.PI / 180) // longitude varies by latitude
      )
    }
  };
}

/**
 * Batch decode multiple DIGIPINs
 * @param {Array<string>} digipins - Array of DIGIPIN codes
 * @returns {Array<Object>} Array of decoded results
 */
function decodeBatch(digipins) {
  if (!Array.isArray(digipins)) {
    throw new Error('DIGIPINs must be an array');
  }

  return digipins.map((pin, index) => {
    try {
      return decode(pin);
    } catch (error) {
      throw new Error(`Error decoding DIGIPIN at index ${index}: ${error.message}`);
    }
  });
}

/**
 * Decode to simple lat/lng format (compatible with original API)
 * @param {string} digiPin - DIGIPIN code
 * @returns {Object} Simple lat/lng object
 */
function decodeSimple(digiPin) {
  const result = decode(digiPin);
  return {
    latitude: result.latitude.toFixed(6),
    longitude: result.longitude.toFixed(6)
  };
}

/**
 * Get all possible coordinates at a given precision level for a DIGIPIN
 * @param {string} digiPin - Base DIGIPIN code
 * @param {number} targetPrecision - Target precision level
 * @returns {Array<Object>} Array of possible coordinates
 */
function getSubDivisions(digiPin, targetPrecision = 10) {
  const pin = digiPin.replace(/-/g, '').toUpperCase();
  
  if (targetPrecision <= pin.length) {
    throw new Error('Target precision must be greater than current DIGIPIN precision');
  }

  const baseDecoded = decode(pin);
  const subdivisions = [];

  // Generate all possible combinations for the remaining levels
  const remainingLevels = targetPrecision - pin.length;
  const totalCombinations = Math.pow(16, remainingLevels);

  for (let i = 0; i < totalCombinations; i++) {
    let extension = '';
    let temp = i;
    
    for (let level = 0; level < remainingLevels; level++) {
      const gridIndex = temp % 16;
      const row = Math.floor(gridIndex / 4);
      const col = gridIndex % 4;
      extension += DIGIPIN_GRID[row][col];
      temp = Math.floor(temp / 16);
    }

    const fullPin = pin + extension;
    subdivisions.push(decode(fullPin));
  }

  return subdivisions;
}

module.exports = {
  decode,
  decodeBatch,
  decodeSimple,
  getSubDivisions
};
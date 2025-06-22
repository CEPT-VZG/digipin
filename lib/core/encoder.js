/**
 * Enhanced DIGIPIN Encoder
 * Advanced encoding functionality with precision levels and batch operations
 */

const { DIGIPIN_GRID, BOUNDS } = require('./constants');

/**
 * Encode a single coordinate pair to DIGIPIN
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude  
 * @param {number} precision - Precision level (1-10), default 10
 * @returns {string} DIGIPIN code
 */
function encode(lat, lon, precision = 10) {
  if (typeof lat !== 'number' || typeof lon !== 'number') {
    throw new Error('Latitude and longitude must be numbers');
  }
  
  if (precision < 1 || precision > 10) {
    throw new Error('Precision must be between 1 and 10');
  }

  if (lat < BOUNDS.minLat || lat > BOUNDS.maxLat) {
    throw new Error(`Latitude ${lat} out of range [${BOUNDS.minLat}, ${BOUNDS.maxLat}]`);
  }
  
  if (lon < BOUNDS.minLon || lon > BOUNDS.maxLon) {
    throw new Error(`Longitude ${lon} out of range [${BOUNDS.minLon}, ${BOUNDS.maxLon}]`);
  }

  let minLat = BOUNDS.minLat;
  let maxLat = BOUNDS.maxLat;
  let minLon = BOUNDS.minLon;
  let maxLon = BOUNDS.maxLon;

  let digiPin = '';

  for (let level = 1; level <= precision; level++) {
    const latDiv = (maxLat - minLat) / 4;
    const lonDiv = (maxLon - minLon) / 4;

    // Reversed row logic to match original implementation
    let row = 3 - Math.floor((lat - minLat) / latDiv);
    let col = Math.floor((lon - minLon) / lonDiv);

    row = Math.max(0, Math.min(row, 3));
    col = Math.max(0, Math.min(col, 3));

    digiPin += DIGIPIN_GRID[row][col];

    // Add hyphens at positions 3 and 6 for full precision
    if (precision === 10 && (level === 3 || level === 6)) {
      digiPin += '-';
    }

    // Update bounds (reverse logic for row)
    maxLat = minLat + latDiv * (4 - row);
    minLat = minLat + latDiv * (3 - row);

    minLon = minLon + lonDiv * col;
    maxLon = minLon + lonDiv;
  }

  return digiPin;
}

/**
 * Batch encode multiple coordinate pairs
 * @param {Array<{lat: number, lon: number, precision?: number}>} coordinates
 * @returns {Array<string>} Array of DIGIPIN codes
 */
function encodeBatch(coordinates) {
  if (!Array.isArray(coordinates)) {
    throw new Error('Coordinates must be an array');
  }

  return coordinates.map(coord => {
    if (!coord || typeof coord.lat !== 'number' || typeof coord.lon !== 'number') {
      throw new Error('Each coordinate must have lat and lon properties');
    }
    return encode(coord.lat, coord.lon, coord.precision);
  });
}

/**
 * Encode with bounds information
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} precision - Precision level
 * @returns {Object} DIGIPIN with bounds information
 */
function encodeWithBounds(lat, lon, precision = 10) {
  const pin = encode(lat, lon, precision);
  
  // Calculate the bounds of the encoded area
  let minLat = BOUNDS.minLat;
  let maxLat = BOUNDS.maxLat;
  let minLon = BOUNDS.minLon;
  let maxLon = BOUNDS.maxLon;

  const cleanPin = pin.replace(/-/g, '');
  
  for (let i = 0; i < Math.min(cleanPin.length, precision); i++) {
    const char = cleanPin[i];
    let ri = -1, ci = -1;

    // Find character position in grid
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (DIGIPIN_GRID[r][c] === char) {
          ri = r;
          ci = c;
          break;
        }
      }
      if (ri !== -1) break;
    }

    const latDiv = (maxLat - minLat) / 4;
    const lonDiv = (maxLon - minLon) / 4;

    const lat1 = maxLat - latDiv * (ri + 1);
    const lat2 = maxLat - latDiv * ri;
    const lon1 = minLon + lonDiv * ci;
    const lon2 = minLon + lonDiv * (ci + 1);

    minLat = lat1;
    maxLat = lat2;
    minLon = lon1;
    maxLon = lon2;
  }

  return {
    digipin: pin,
    bounds: {
      north: maxLat,
      south: minLat,
      east: maxLon,
      west: minLon
    },
    center: {
      lat: (minLat + maxLat) / 2,
      lon: (minLon + maxLon) / 2
    },
    area: (maxLat - minLat) * (maxLon - minLon)
  };
}

module.exports = {
  encode,
  encodeBatch,
  encodeWithBounds
};
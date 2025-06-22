/**
 * DIGIPIN Validation Utilities
 * Comprehensive validation with detailed error messages
 */

const { DIGIPIN_CHARS, DIGIPIN_PATTERN, DIGIPIN_FULL_PATTERN, BOUNDS } = require('./constants');

/**
 * Validate a DIGIPIN string
 * @param {string} digiPin - DIGIPIN to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
function validate(digiPin, options = {}) {
  const {
    requireFullPrecision = false,
    allowPartial = true,
    requireHyphens = false
  } = options;

  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    info: {}
  };

  // Basic type check
  if (typeof digiPin !== 'string') {
    result.isValid = false;
    result.errors.push('DIGIPIN must be a string');
    return result;
  }

  // Empty string check
  if (!digiPin.trim()) {
    result.isValid = false;
    result.errors.push('DIGIPIN cannot be empty');
    return result;
  }

  const originalPin = digiPin.trim().toUpperCase();
  const cleanPin = originalPin.replace(/-/g, '');

  // Length validation
  if (cleanPin.length === 0) {
    result.isValid = false;
    result.errors.push('DIGIPIN contains no valid characters');
    return result;
  }

  if (cleanPin.length > 10) {
    result.isValid = false;
    result.errors.push(`DIGIPIN too long: ${cleanPin.length} characters (maximum 10)`);
    return result;
  }

  if (requireFullPrecision && cleanPin.length !== 10) {
    result.isValid = false;
    result.errors.push(`Full precision required: expected 10 characters, got ${cleanPin.length}`);
  }

  if (!allowPartial && cleanPin.length < 10) {
    result.isValid = false;
    result.errors.push(`Partial DIGIPIN not allowed: expected 10 characters, got ${cleanPin.length}`);
  }

  // Character validation
  const invalidChars = [];
  for (let i = 0; i < cleanPin.length; i++) {
    const char = cleanPin[i];
    if (!DIGIPIN_CHARS.includes(char)) {
      invalidChars.push({ char, position: i + 1 });
    }
  }

  if (invalidChars.length > 0) {
    result.isValid = false;
    invalidChars.forEach(({ char, position }) => {
      result.errors.push(`Invalid character '${char}' at position ${position}`);
    });
    result.errors.push(`Valid characters: ${DIGIPIN_CHARS.join(', ')}`);
  }

  // Hyphen validation
  if (requireHyphens && originalPin.length === 12) {
    if (originalPin[3] !== '-' || originalPin[7] !== '-') {
      result.isValid = false;
      result.errors.push('Hyphens required at positions 4 and 8 (XXX-XXX-XXXX format)');
    }
  }

  // Format validation for full DIGIPINs with hyphens
  if (originalPin.includes('-')) {
    // Check if it matches the expected pattern allowing for different lengths
    const parts = originalPin.split('-');
    if (parts.length === 2 && cleanPin.length <= 10) {
      // Accept XX-XXXXXXXX format for shorter pins
    } else if (parts.length === 3 && parts[0].length === 3 && parts[1].length === 3 && parts[2].length === 4) {
      // Accept XXX-XXX-XXXX format for full pins
    } else {
      result.isValid = false;
      result.errors.push('Invalid DIGIPIN format. Expected: XXX-XXX-XXXX for full precision or similar format for partial');
    }
  }

  // Add info about the DIGIPIN
  if (result.isValid && result.errors.length === 0) {
    result.info = {
      originalFormat: originalPin,
      cleanFormat: cleanPin,
      precision: cleanPin.length,
      hasHyphens: originalPin.includes('-'),
      estimatedAccuracy: getEstimatedAccuracy(cleanPin.length)
    };

    // Warnings for common issues
    if (cleanPin.length < 6) {
      result.warnings.push(`Low precision: ${cleanPin.length} characters (recommended: 6+ for city-level accuracy)`);
    }

    if (originalPin.includes('-') && cleanPin.length !== 10) {
      result.warnings.push('Hyphens typically used only with full 10-character DIGIPINs');
    }
  }

  return result;
}

/**
 * Get estimated accuracy for a given precision level
 * @param {number} precision - Precision level (1-10)
 * @returns {Object} Accuracy information
 */
function getEstimatedAccuracy(precision) {
  const accuracyMap = {
    1: { meters: 1000000, description: '~1000 km' },
    2: { meters: 250000, description: '~250 km' },
    3: { meters: 62500, description: '~62.5 km' },
    4: { meters: 15600, description: '~15.6 km' },
    5: { meters: 3900, description: '~3.9 km' },
    6: { meters: 1000, description: '~1 km' },
    7: { meters: 250, description: '~250 m' },
    8: { meters: 60, description: '~60 m' },
    9: { meters: 15, description: '~15 m' },
    10: { meters: 3.8, description: '~3.8 m' }
  };

  return accuracyMap[precision] || { meters: 0, description: 'Unknown' };
}

/**
 * Validate coordinates are within DIGIPIN bounds
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Object} Validation result
 */
function validateCoordinates(lat, lon) {
  const result = {
    isValid: true,
    errors: [],
    warnings: []
  };

  if (typeof lat !== 'number' || typeof lon !== 'number') {
    result.isValid = false;
    result.errors.push('Latitude and longitude must be numbers');
    return result;
  }

  if (lat < BOUNDS.minLat || lat > BOUNDS.maxLat) {
    result.isValid = false;
    result.errors.push(`Latitude ${lat} out of DIGIPIN bounds [${BOUNDS.minLat}, ${BOUNDS.maxLat}]`);
  }

  if (lon < BOUNDS.minLon || lon > BOUNDS.maxLon) {
    result.isValid = false;
    result.errors.push(`Longitude ${lon} out of DIGIPIN bounds [${BOUNDS.minLon}, ${BOUNDS.maxLon}]`);
  }

  // Warnings for edge cases
  const buffer = 0.1; // degrees
  if (lat < BOUNDS.minLat + buffer || lat > BOUNDS.maxLat - buffer) {
    result.warnings.push('Latitude near DIGIPIN boundary - accuracy may be affected');
  }

  if (lon < BOUNDS.minLon + buffer || lon > BOUNDS.maxLon - buffer) {
    result.warnings.push('Longitude near DIGIPIN boundary - accuracy may be affected');
  }

  return result;
}

/**
 * Quick validation - returns boolean
 * @param {string} digiPin - DIGIPIN to validate
 * @returns {boolean} True if valid
 */
function isValid(digiPin) {
  try {
    return validate(digiPin).isValid;
  } catch {
    return false;
  }
}

module.exports = {
  validate,
  validateCoordinates,
  isValid,
  getEstimatedAccuracy
};
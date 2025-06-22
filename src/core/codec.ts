/**
 * Core DIGIPIN Encoding/Decoding Functions
 * 
 * Enhanced version of the original DIGIPIN implementation with TypeScript,
 * comprehensive validation, error handling, and documentation.
 */

import { 
  Coordinates, 
  DigipinString, 
  ValidatedDigipin, 
  Bounds, 
  GridCell,
  ValidationResult 
} from '../types';
import { 
  DIGIPIN_GRID, 
  VALID_DIGIPIN_CHARS, 
  INDIA_BOUNDS, 
  DIGIPIN_LENGTH, 
  MAX_LEVEL,
  DIGIPIN_PATTERNS 
} from './constants';
import { 
  DigipinValidationError, 
  DigipinCoordinatesError, 
  DigipinFormatError, 
  DigipinBoundsError 
} from './errors';

/**
 * Validates and sanitizes input coordinates
 * @param lat - Latitude in decimal degrees
 * @param lon - Longitude in decimal degrees  
 * @returns Validated coordinates
 * @throws {DigipinCoordinatesError} If coordinates are invalid
 */
export function validateCoordinates(lat: number, lon: number): Coordinates {
  // Check for valid numbers
  if (typeof lat !== 'number' || typeof lon !== 'number') {
    throw new DigipinCoordinatesError('Coordinates must be numbers', {
      latitude: lat,
      longitude: lon,
      type: typeof lat + ', ' + typeof lon
    });
  }

  // Check for NaN or infinite values
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new DigipinCoordinatesError('Coordinates must be finite numbers', {
      latitude: lat,
      longitude: lon,
      isFiniteLat: Number.isFinite(lat),
      isFiniteLon: Number.isFinite(lon)
    });
  }

  // Check bounds
  if (lat < INDIA_BOUNDS.minLat || lat > INDIA_BOUNDS.maxLat) {
    throw new DigipinBoundsError(`Latitude ${lat} is outside India bounds (${INDIA_BOUNDS.minLat} to ${INDIA_BOUNDS.maxLat})`, {
      latitude: lat,
      bounds: INDIA_BOUNDS
    });
  }

  if (lon < INDIA_BOUNDS.minLon || lon > INDIA_BOUNDS.maxLon) {
    throw new DigipinBoundsError(`Longitude ${lon} is outside India bounds (${INDIA_BOUNDS.minLon} to ${INDIA_BOUNDS.maxLon})`, {
      longitude: lon,
      bounds: INDIA_BOUNDS
    });
  }

  return { latitude: lat, longitude: lon };
}

/**
 * Validates DIGIPIN format and characters
 * @param digipin - DIGIPIN string to validate
 * @returns Validation result with details
 */
export function validateDigipinFormat(digipin: string): ValidationResult {
  if (typeof digipin !== 'string') {
    return {
      valid: false,
      error: 'DIGIPIN must be a string',
      details: { format: false, characters: false, bounds: false }
    };
  }

  const trimmed = digipin.trim().toUpperCase();
  
  // Check format (with or without hyphens)
  const formatValid = DIGIPIN_PATTERNS.EITHER.test(trimmed);
  if (!formatValid) {
    return {
      valid: false,
      error: 'Invalid DIGIPIN format. Expected XXX-XXX-XXXX or XXXXXXXXXX',
      details: { format: false, characters: false, bounds: false }
    };
  }

  // Remove hyphens and check length
  const cleaned = trimmed.replace(/-/g, '');
  if (cleaned.length !== DIGIPIN_LENGTH) {
    return {
      valid: false,
      error: `Invalid DIGIPIN length. Expected ${DIGIPIN_LENGTH} characters, got ${cleaned.length}`,
      details: { format: false, characters: false, bounds: false }
    };
  }

  // Check characters
  const charactersValid = cleaned.split('').every(char => VALID_DIGIPIN_CHARS.has(char));
  if (!charactersValid) {
    const invalidChars = cleaned.split('').filter(char => !VALID_DIGIPIN_CHARS.has(char));
    return {
      valid: false,
      error: `Invalid characters in DIGIPIN: ${invalidChars.join(', ')}`,
      details: { format: true, characters: false, bounds: false }
    };
  }

  return {
    valid: true,
    details: { format: true, characters: true, bounds: true }
  };
}

/**
 * Sanitizes and validates a DIGIPIN string
 * @param digipin - DIGIPIN string to sanitize
 * @returns Clean DIGIPIN without hyphens
 * @throws {DigipinFormatError} If DIGIPIN format is invalid
 */
export function sanitizeDigipin(digipin: string): ValidatedDigipin {
  const validation = validateDigipinFormat(digipin);
  
  if (!validation.valid) {
    throw new DigipinFormatError(validation.error!, {
      input: digipin,
      validation: validation.details
    });
  }

  return digipin.trim().toUpperCase().replace(/-/g, '');
}

/**
 * Formats a DIGIPIN with standard hyphens (XXX-XXX-XXXX)
 * @param digipin - DIGIPIN string (with or without hyphens)
 * @returns Formatted DIGIPIN string
 */
export function formatDigipin(digipin: string): DigipinString {
  const clean = sanitizeDigipin(digipin);
  return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`;
}

/**
 * Encodes latitude and longitude coordinates into a DIGIPIN
 * 
 * @param lat - Latitude in decimal degrees
 * @param lon - Longitude in decimal degrees
 * @param options - Encoding options
 * @returns DIGIPIN string in format XXX-XXX-XXXX
 * 
 * @example
 * ```typescript
 * const digipin = encode(12.9716, 77.5946);
 * console.log(digipin); // "J52-M8M-MPCT"
 * ```
 */
export function encode(
  lat: number, 
  lon: number, 
  options: { format?: boolean } = { format: true }
): DigipinString {
  // Validate coordinates
  const coords = validateCoordinates(lat, lon);
  
  let minLat = INDIA_BOUNDS.minLat;
  let maxLat = INDIA_BOUNDS.maxLat;
  let minLon = INDIA_BOUNDS.minLon;
  let maxLon = INDIA_BOUNDS.maxLon;

  let digiPin = '';

  for (let level = 1; level <= MAX_LEVEL; level++) {
    const latDiv = (maxLat - minLat) / 4;
    const lonDiv = (maxLon - minLon) / 4;

    // Calculate grid position (reversed row logic to match original implementation)
    let row = Math.max(0, Math.min(3, 3 - Math.floor((coords.latitude - minLat) / latDiv)));
    let col = Math.max(0, Math.min(3, Math.floor((coords.longitude - minLon) / lonDiv)));

    // Add character from grid
    digiPin += DIGIPIN_GRID[row][col];

    // Add hyphens at standard positions for formatting
    if (options.format && (level === 3 || level === 6)) {
      digiPin += '-';
    }

    // Update bounds for next iteration (reverse logic for row)
    maxLat = minLat + latDiv * (4 - row);
    minLat = minLat + latDiv * (3 - row);

    minLon = minLon + lonDiv * col;
    maxLon = minLon + lonDiv;
  }

  return digiPin;
}

/**
 * Decodes a DIGIPIN back into its center coordinates
 * 
 * @param digipin - DIGIPIN string (with or without hyphens)
 * @returns Coordinates object with latitude and longitude
 * 
 * @example
 * ```typescript
 * const coords = decode("J52-M8M-MPCT");
 * console.log(coords.latitude, coords.longitude); // 12.971600, 77.594600
 * ```
 */
export function decode(digipin: DigipinString): Coordinates {
  // Sanitize and validate DIGIPIN
  const cleanPin = sanitizeDigipin(digipin);
  
  let minLat = INDIA_BOUNDS.minLat;
  let maxLat = INDIA_BOUNDS.maxLat;
  let minLon = INDIA_BOUNDS.minLon;
  let maxLon = INDIA_BOUNDS.maxLon;

  for (let i = 0; i < DIGIPIN_LENGTH; i++) {
    const char = cleanPin[i];
    let found = false;
    let ri = -1, ci = -1;

    // Locate character in DIGIPIN grid
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (DIGIPIN_GRID[r][c] === char) {
          ri = r;
          ci = c;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) {
      throw new DigipinFormatError(`Invalid character '${char}' at position ${i + 1}`, {
        character: char,
        position: i + 1,
        digipin: cleanPin
      });
    }

    const latDiv = (maxLat - minLat) / 4;
    const lonDiv = (maxLon - minLon) / 4;

    // Calculate bounds for this grid cell
    const lat1 = maxLat - latDiv * (ri + 1);
    const lat2 = maxLat - latDiv * ri;
    const lon1 = minLon + lonDiv * ci;
    const lon2 = minLon + lonDiv * (ci + 1);

    // Update bounding box for next level
    minLat = lat1;
    maxLat = lat2;
    minLon = lon1;
    maxLon = lon2;
  }

  // Return center coordinates
  const centerLat = (minLat + maxLat) / 2;
  const centerLon = (minLon + maxLon) / 2;

  return {
    latitude: parseFloat(centerLat.toFixed(6)),
    longitude: parseFloat(centerLon.toFixed(6))
  };
}

/**
 * Gets the bounding box for a DIGIPIN
 * @param digipin - DIGIPIN string
 * @returns Bounds object with min/max lat/lon
 */
export function getBounds(digipin: DigipinString): Bounds {
  const cleanPin = sanitizeDigipin(digipin);
  
  let minLat = INDIA_BOUNDS.minLat;
  let maxLat = INDIA_BOUNDS.maxLat;
  let minLon = INDIA_BOUNDS.minLon;
  let maxLon = INDIA_BOUNDS.maxLon;

  for (let i = 0; i < cleanPin.length; i++) {
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

  return { minLat, maxLat, minLon, maxLon };
}

/**
 * Gets detailed grid cell information for a DIGIPIN
 * @param digipin - DIGIPIN string
 * @returns GridCell object with comprehensive information
 */
export function getGridCell(digipin: DigipinString): GridCell {
  const cleanPin = sanitizeDigipin(digipin);
  const bounds = getBounds(cleanPin);
  const center = decode(cleanPin);
  const level = cleanPin.length;

  return {
    digipin: formatDigipin(cleanPin),
    bounds,
    center,
    level
  };
}
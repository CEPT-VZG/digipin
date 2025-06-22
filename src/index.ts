/**
 * @cept-vzg/digipin - Comprehensive DIGIPIN Library
 * 
 * A feature-rich library for working with DIGIPINs (Digital Postal Index Numbers)
 * developed by the Department of Posts, Government of India.
 * 
 * @author Department of Posts, Government of India
 * @license Apache-2.0
 * @version 2.0.0
 */

// Core functions
export { 
  encode, 
  decode, 
  validateCoordinates, 
  sanitizeDigipin, 
  formatDigipin, 
  getBounds, 
  getGridCell,
  validateDigipinFormat
} from './core/codec';

// Error classes
export { 
  BaseDigipinError,
  DigipinValidationError,
  DigipinCoordinatesError,
  DigipinFormatError,
  DigipinBoundsError,
  DigipinBatchError,
  DigipinPluginError
} from './core/errors';

// Constants
export { 
  DIGIPIN_GRID,
  VALID_DIGIPIN_CHARS,
  INDIA_BOUNDS,
  DIGIPIN_LENGTH,
  DIGIPIN_FORMATTED_LENGTH,
  GRID_SIZE,
  MAX_LEVEL,
  EARTH_RADIUS_METERS,
  EARTH_RADIUS_KM,
  GRID_SIZES_DEGREES,
  GRID_SIZES_METERS,
  DIGIPIN_PATTERNS
} from './core/constants';

// Type definitions
export type {
  Coordinates,
  DigipinString,
  ValidatedDigipin,
  Bounds,
  GridCell,
  DistanceResult,
  BearingResult,
  BatchOptions,
  BatchResult,
  NeighborOptions,
  DigipinError,
  ValidationResult,
  PerformanceMetrics,
  DigipinPlugin,
  StreamOptions,
  LeafletIntegration,
  GoogleMapsIntegration
} from './types';

// Advanced utilities
export { 
  calculateDistance,
  calculateDigipinDistance,
  calculateBearing,
  calculateDigipinBearing,
  calculateMidpoint,
  calculateDigipinMidpoint
} from './utils/distance';

export {
  batchEncode,
  batchDecode,
  batchValidate,
  batchEncodeSync,
  batchDecodeSync
} from './utils/batch';

export {
  getNeighbors,
  getAdjacentNeighbors,
  getAllNeighbors,
  getNeighborsInRadius,
  getParentDigipin,
  getChildrenDigipins,
  getDigipinsInBounds,
  findNearestDigipin
} from './utils/neighbors';

// Advanced utilities (to be implemented)
// export * from './utils/validation';
// export * from './utils/geographic';
// export * from './utils/performance';

// Integrations (to be implemented)
// export * from './integrations/leaflet';
// export * from './integrations/googlemaps';

// Plugin system (to be implemented)  
// export * from './core/plugins';

// Streaming support (to be implemented)
// export * from './utils/streaming';

/**
 * Default export with all main functions
 */
import { 
  encode, 
  decode, 
  validateCoordinates,
  sanitizeDigipin,
  formatDigipin,
  getBounds,
  getGridCell,
  validateDigipinFormat
} from './core/codec';

const Digipin = {
  encode,
  decode,
  validateCoordinates,
  sanitizeDigipin,
  formatDigipin,
  getBounds,
  getGridCell,
  validateDigipinFormat,
  // Compatibility with original API
  getDigiPin: encode,
  getLatLngFromDigiPin: decode
};

export default Digipin;
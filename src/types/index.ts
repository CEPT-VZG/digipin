/**
 * DIGIPIN Type Definitions
 * 
 * Comprehensive TypeScript types for the DIGIPIN library
 */

/** Coordinate pair representing latitude and longitude */
export interface Coordinates {
  /** Latitude in decimal degrees */
  latitude: number;
  /** Longitude in decimal degrees */
  longitude: number;
}

/** DIGIPIN string format with optional hyphens */
export type DigipinString = string;

/** Validated DIGIPIN string (10 characters without hyphens) */
export type ValidatedDigipin = string;

/** Grid bounds for DIGIPIN calculations */
export interface Bounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

/** DIGIPIN grid cell information */
export interface GridCell {
  digipin: DigipinString;
  bounds: Bounds;
  center: Coordinates;
  level: number;
}

/** Distance calculation result */
export interface DistanceResult {
  /** Distance in meters */
  meters: number;
  /** Distance in kilometers */
  kilometers: number;
  /** Distance in miles */
  miles: number;
}

/** Bearing calculation result */
export interface BearingResult {
  /** Initial bearing in degrees */
  initial: number;
  /** Final bearing in degrees */
  final: number;
}

/** Batch processing options */
export interface BatchOptions {
  /** Maximum number of items to process in parallel */
  concurrency?: number;
  /** Progress callback function */
  onProgress?: (processed: number, total: number) => void;
  /** Error handling strategy */
  errorStrategy?: 'stop' | 'continue' | 'collect';
}

/** Batch processing result */
export interface BatchResult<T> {
  /** Successfully processed results */
  results: T[];
  /** Errors encountered during processing */
  errors: Array<{
    index: number;
    error: Error;
    input: unknown;
  }>;
  /** Processing statistics */
  stats: {
    total: number;
    successful: number;
    failed: number;
    duration: number;
  };
}

/** Neighbor discovery options */
export interface NeighborOptions {
  /** Include diagonal neighbors */
  includeDiagonals?: boolean;
  /** Maximum distance in grid levels */
  maxDistance?: number;
  /** Filter function for neighbors */
  filter?: (neighbor: GridCell) => boolean;
}

/** Custom error types */
export interface DigipinError extends Error {
  code: string;
  details?: Record<string, unknown>;
}

/** Validation result */
export interface ValidationResult {
  /** Whether the input is valid */
  valid: boolean;
  /** Error message if invalid */
  error?: string;
  /** Validation details */
  details?: {
    format: boolean;
    characters: boolean;
    bounds: boolean;
  };
}

/** Performance metrics */
export interface PerformanceMetrics {
  /** Operation name */
  operation: string;
  /** Duration in milliseconds */
  duration: number;
  /** Memory usage in bytes */
  memoryUsage?: number;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/** Plugin interface */
export interface DigipinPlugin {
  /** Plugin name */
  name: string;
  /** Plugin version */
  version: string;
  /** Initialize the plugin */
  init?: (options?: Record<string, unknown>) => void;
  /** Plugin methods */
  methods?: Record<string, (...args: unknown[]) => unknown>;
}

/** Streaming options */
export interface StreamOptions {
  /** Chunk size for processing */
  chunkSize?: number;
  /** Transform function */
  transform?: (chunk: unknown) => unknown;
  /** High water mark for stream */
  highWaterMark?: number;
}

/** Integration helper types */
export interface LeafletIntegration {
  /** Convert DIGIPIN to Leaflet bounds */
  toBounds: (digipin: DigipinString) => unknown;
  /** Create marker from DIGIPIN */
  createMarker: (digipin: DigipinString, options?: unknown) => unknown;
}

export interface GoogleMapsIntegration {
  /** Convert DIGIPIN to Google Maps bounds */
  toBounds: (digipin: DigipinString) => unknown;
  /** Create marker from DIGIPIN */
  createMarker: (digipin: DigipinString, options?: unknown) => unknown;
}
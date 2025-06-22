/**
 * DIGIPIN Constants and Configuration
 */

import { Bounds } from '../types';

/** DIGIPIN character grid for encoding/decoding */
export const DIGIPIN_GRID: string[][] = [
  ['F', 'C', '9', '8'],
  ['J', '3', '2', '7'],
  ['K', '4', '5', '6'],
  ['L', 'M', 'P', 'T']
];

/** Valid DIGIPIN characters set for quick validation */
export const VALID_DIGIPIN_CHARS = new Set(['F', 'C', '9', '8', 'J', '3', '2', '7', 'K', '4', '5', '6', 'L', 'M', 'P', 'T']);

/** DIGIPIN geographic bounds for India */
export const INDIA_BOUNDS: Bounds = {
  minLat: 2.5,
  maxLat: 38.5,
  minLon: 63.5,
  maxLon: 99.5
};

/** DIGIPIN standard length (without hyphens) */
export const DIGIPIN_LENGTH = 10;

/** DIGIPIN formatted length (with hyphens) */
export const DIGIPIN_FORMATTED_LENGTH = 12;

/** Grid dimensions */
export const GRID_SIZE = 4;

/** Maximum precision level */
export const MAX_LEVEL = 10;

/** Earth radius in meters for distance calculations */
export const EARTH_RADIUS_METERS = 6371000;

/** Earth radius in kilometers for distance calculations */
export const EARTH_RADIUS_KM = 6371;

/** Conversion factors */
export const METERS_TO_KM = 0.001;
export const METERS_TO_MILES = 0.000621371;
export const KM_TO_MILES = 0.621371;

/** Default batch processing options */
export const DEFAULT_BATCH_OPTIONS = {
  concurrency: 10,
  errorStrategy: 'continue' as const
};

/** Performance monitoring configuration */
export const PERFORMANCE_CONFIG = {
  enableMetrics: true,
  sampleRate: 0.1, // 10% sampling
  maxHistorySize: 1000
};

/** Grid size at each level (in degrees) */
export const GRID_SIZES_DEGREES: number[] = [
  9.0,      // Level 1: 9° x 9°
  2.25,     // Level 2: 2.25° x 2.25°
  0.5625,   // Level 3: 0.5625° x 0.5625°
  0.140625, // Level 4: 0.140625° x 0.140625°
  0.03515625, // Level 5: ~0.035° x ~0.035°
  0.008789063, // Level 6: ~0.009° x ~0.009°
  0.002197266, // Level 7: ~0.002° x ~0.002°
  0.000549316, // Level 8: ~0.0005° x ~0.0005°
  0.000137329, // Level 9: ~0.0001° x ~0.0001°
  0.000034332  // Level 10: ~0.00003° x ~0.00003°
];

/** Approximate grid size in meters at equator for each level */
export const GRID_SIZES_METERS: number[] = [
  1000000,  // Level 1: ~1000 km
  250000,   // Level 2: ~250 km
  62500,    // Level 3: ~62.5 km
  15625,    // Level 4: ~15.6 km
  3906,     // Level 5: ~3.9 km
  977,      // Level 6: ~977 m
  244,      // Level 7: ~244 m
  61,       // Level 8: ~61 m
  15,       // Level 9: ~15 m
  3.8       // Level 10: ~3.8 m
];

/** Regular expressions for validation */
export const DIGIPIN_PATTERNS = {
  /** DIGIPIN with hyphens (XXX-XXX-XXXX) */
  FORMATTED: /^[FCJ2-9KLMPT]{3}-[FCJ2-9KLMPT]{3}-[FCJ2-9KLMPT]{4}$/i,
  /** DIGIPIN without hyphens (10 characters) */
  UNFORMATTED: /^[FCJ2-9KLMPT]{10}$/i,
  /** Either format */
  EITHER: /^[FCJ2-9KLMPT]{3}-?[FCJ2-9KLMPT]{3}-?[FCJ2-9KLMPT]{4}$/i
};
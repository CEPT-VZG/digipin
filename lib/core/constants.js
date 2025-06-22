/**
 * DIGIPIN Constants and Grid Definitions
 * Enhanced version of the original DIGIPIN constants with additional utilities
 */

// Original DIGIPIN 4x4 grid used for encoding/decoding
const DIGIPIN_GRID = [
  ['F', 'C', '9', '8'],
  ['J', '3', '2', '7'],
  ['K', '4', '5', '6'],
  ['L', 'M', 'P', 'T']
];

// Flattened version for quick lookups
const DIGIPIN_CHARS = DIGIPIN_GRID.flat();

// Character to position mapping for faster decoding
const CHAR_TO_POSITION = {};
DIGIPIN_GRID.forEach((row, r) => {
  row.forEach((char, c) => {
    CHAR_TO_POSITION[char] = { row: r, col: c };
  });
});

// India's bounding box as defined in DIGIPIN specification
const BOUNDS = {
  minLat: 2.5,
  maxLat: 38.5,
  minLon: 63.5,
  maxLon: 99.5
};

// Grid dimensions for different precision levels
const GRID_SIZES = [
  { level: 1, width: 9, distance: 1000000 },      // ~1000 km
  { level: 2, width: 2.25, distance: 250000 },    // ~250 km
  { level: 3, width: 0.5625, distance: 62500 },   // ~62.5 km
  { level: 4, width: 0.140625, distance: 15600 }, // ~15.6 km
  { level: 5, width: 0.0351563, distance: 3900 }, // ~3.9 km
  { level: 6, width: 0.0087891, distance: 1000 }, // ~1 km
  { level: 7, width: 0.0021973, distance: 250 },  // ~250 m
  { level: 8, width: 0.0005493, distance: 60 },   // ~60 m
  { level: 9, width: 0.0001373, distance: 15 },   // ~15 m
  { level: 10, width: 0.0000343, distance: 3.8 }  // ~3.8 m
];

// Validation patterns
const DIGIPIN_PATTERN = /^[FCJ3K45LMPTXYZ2678-]+$/;
const DIGIPIN_FULL_PATTERN = /^[FCJ3K45LMPTXYZ2678]{3}-[FCJ3K45LMPTXYZ2678]{3}-[FCJ3K45LMPTXYZ2678]{4}$/;

// Earth's radius in meters (for distance calculations)
const EARTH_RADIUS = 6371000;

module.exports = {
  DIGIPIN_GRID,
  DIGIPIN_CHARS,
  CHAR_TO_POSITION,
  BOUNDS,
  GRID_SIZES,
  DIGIPIN_PATTERN,
  DIGIPIN_FULL_PATTERN,
  EARTH_RADIUS
};
/**
 * Neighbor Finding Utilities
 * Find adjacent and nearby DIGIPIN codes
 */

const { DIGIPIN_GRID, BOUNDS } = require('../core/constants');
const { encode } = require('../core/encoder');
const { decode } = require('../core/decoder');

/**
 * Get immediate neighbors of a DIGIPIN (8-directional)
 * @param {string} digipin - Input DIGIPIN
 * @returns {Array<string>} Array of neighbor DIGIPINs
 */
function getNeighbors(digipin) {
  const decoded = decode(digipin);
  const bounds = decoded.bounds;
  const precision = decoded.precision;
  
  // Calculate step size for this precision level
  const latStep = bounds.north - bounds.south;
  const lonStep = bounds.east - bounds.west;
  
  const centerLat = decoded.latitude;
  const centerLon = decoded.longitude;
  
  const neighbors = [];
  
  // 8 directions: N, NE, E, SE, S, SW, W, NW
  const directions = [
    { lat: latStep, lon: 0 },        // N
    { lat: latStep, lon: lonStep },  // NE
    { lat: 0, lon: lonStep },        // E
    { lat: -latStep, lon: lonStep }, // SE
    { lat: -latStep, lon: 0 },       // S
    { lat: -latStep, lon: -lonStep }, // SW
    { lat: 0, lon: -lonStep },       // W
    { lat: latStep, lon: -lonStep }  // NW
  ];
  
  directions.forEach(({ lat, lon }) => {
    const newLat = centerLat + lat;
    const newLon = centerLon + lon;
    
    // Check if within bounds
    if (newLat >= BOUNDS.minLat && newLat <= BOUNDS.maxLat &&
        newLon >= BOUNDS.minLon && newLon <= BOUNDS.maxLon) {
      try {
        const neighborPin = encode(newLat, newLon, precision);
        neighbors.push(neighborPin);
      } catch (error) {
        // Skip if encoding fails
      }
    }
  });
  
  return neighbors;
}

/**
 * Get neighbors within a specific radius
 * @param {string} digipin - Input DIGIPIN
 * @param {number} radius - Radius in grid cells
 * @returns {Array<string>} Array of neighbor DIGIPINs
 */
function getNeighborsInRadius(digipin, radius = 1) {
  const decoded = decode(digipin);
  const bounds = decoded.bounds;
  const precision = decoded.precision;
  
  const latStep = bounds.north - bounds.south;
  const lonStep = bounds.east - bounds.west;
  
  const centerLat = decoded.latitude;
  const centerLon = decoded.longitude;
  
  const neighbors = [];
  
  for (let latOffset = -radius; latOffset <= radius; latOffset++) {
    for (let lonOffset = -radius; lonOffset <= radius; lonOffset++) {
      // Skip the center cell
      if (latOffset === 0 && lonOffset === 0) continue;
      
      const newLat = centerLat + (latOffset * latStep);
      const newLon = centerLon + (lonOffset * lonStep);
      
      // Check if within bounds
      if (newLat >= BOUNDS.minLat && newLat <= BOUNDS.maxLat &&
          newLon >= BOUNDS.minLon && newLon <= BOUNDS.maxLon) {
        try {
          const neighborPin = encode(newLat, newLon, precision);
          neighbors.push(neighborPin);
        } catch (error) {
          // Skip if encoding fails
        }
      }
    }
  }
  
  return neighbors;
}

/**
 * Get all child DIGIPINs at the next precision level
 * @param {string} digipin - Parent DIGIPIN
 * @returns {Array<string>} Array of 16 child DIGIPINs
 */
function getChildren(digipin) {
  const cleanPin = digipin.replace(/-/g, '');
  
  if (cleanPin.length >= 10) {
    throw new Error('Cannot get children of maximum precision DIGIPIN');
  }
  
  const children = [];
  
  // Generate all 16 possible children by appending each grid character
  DIGIPIN_GRID.flat().forEach(char => {
    const childPin = cleanPin + char;
    // Add hyphens if needed for display format
    if (childPin.length === 10) {
      const formatted = `${childPin.slice(0, 3)}-${childPin.slice(3, 6)}-${childPin.slice(6)}`;
      children.push(formatted);
    } else {
      children.push(childPin);
    }
  });
  
  return children;
}

/**
 * Get the parent DIGIPIN at the previous precision level
 * @param {string} digipin - Child DIGIPIN
 * @returns {string} Parent DIGIPIN
 */
function getParent(digipin) {
  const cleanPin = digipin.replace(/-/g, '');
  
  if (cleanPin.length <= 1) {
    throw new Error('Cannot get parent of minimum precision DIGIPIN');
  }
  
  return cleanPin.slice(0, -1);
}

/**
 * Get all siblings of a DIGIPIN (same parent, different last character)
 * @param {string} digipin - Input DIGIPIN
 * @returns {Array<string>} Array of sibling DIGIPINs
 */
function getSiblings(digipin) {
  try {
    const parent = getParent(digipin);
    const children = getChildren(parent);
    // Remove the input DIGIPIN from siblings
    return children.filter(child => child.replace(/-/g, '') !== digipin.replace(/-/g, ''));
  } catch (error) {
    return [];
  }
}

/**
 * Find the nearest DIGIPIN to given coordinates at specified precision
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} precision - Precision level
 * @returns {string} Nearest DIGIPIN
 */
function findNearest(lat, lon, precision = 10) {
  return encode(lat, lon, precision);
}

/**
 * Get a grid of DIGIPINs around a center point
 * @param {string} centerDigipin - Center DIGIPIN
 * @param {number} gridSize - Size of the grid (e.g., 3 for 3x3 grid)
 * @returns {Array<Array<string>>} 2D array of DIGIPINs
 */
function getGrid(centerDigipin, gridSize = 3) {
  if (gridSize % 2 === 0) {
    throw new Error('Grid size must be odd to have a center');
  }
  
  const decoded = decode(centerDigipin);
  const bounds = decoded.bounds;
  const precision = decoded.precision;
  
  const latStep = bounds.north - bounds.south;
  const lonStep = bounds.east - bounds.west;
  
  const centerLat = decoded.latitude;
  const centerLon = decoded.longitude;
  
  const radius = Math.floor(gridSize / 2);
  const grid = [];
  
  for (let latOffset = radius; latOffset >= -radius; latOffset--) {
    const row = [];
    for (let lonOffset = -radius; lonOffset <= radius; lonOffset++) {
      const newLat = centerLat + (latOffset * latStep);
      const newLon = centerLon + (lonOffset * lonStep);
      
      if (newLat >= BOUNDS.minLat && newLat <= BOUNDS.maxLat &&
          newLon >= BOUNDS.minLon && newLon <= BOUNDS.maxLon) {
        try {
          const gridPin = encode(newLat, newLon, precision);
          row.push(gridPin);
        } catch (error) {
          row.push(null);
        }
      } else {
        row.push(null);
      }
    }
    grid.push(row);
  }
  
  return grid;
}

/**
 * Check if two DIGIPINs are neighbors
 * @param {string} digipin1 - First DIGIPIN
 * @param {string} digipin2 - Second DIGIPIN
 * @returns {boolean} True if neighbors
 */
function areNeighbors(digipin1, digipin2) {
  const neighbors = getNeighbors(digipin1);
  return neighbors.includes(digipin2);
}

/**
 * Get border DIGIPINs for a region
 * @param {Array<string>} digipins - Region DIGIPINs
 * @returns {Array<string>} Border DIGIPINs
 */
function getBorderDigipins(digipins) {
  const digipinSet = new Set(digipins);
  const borderDigipins = new Set();
  
  digipins.forEach(digipin => {
    const neighbors = getNeighbors(digipin);
    const hasExternalNeighbor = neighbors.some(neighbor => !digipinSet.has(neighbor));
    
    if (hasExternalNeighbor) {
      borderDigipins.add(digipin);
    }
  });
  
  return Array.from(borderDigipins);
}

module.exports = {
  getNeighbors,
  getNeighborsInRadius,
  getChildren,
  getParent,
  getSiblings,
  findNearest,
  getGrid,
  areNeighbors,
  getBorderDigipins
};
/**
 * Grid Operations Utilities
 * Generate and manipulate DIGIPIN grids for geographic areas
 */

const { BOUNDS } = require('../core/constants');
const { encode } = require('../core/encoder');
const { decode } = require('../core/decoder');
const { isPointInDigipin } = require('./geometry');

/**
 * Generate a grid of DIGIPINs for a bounding box
 * @param {Object} bounds - Bounding box {north, south, east, west}
 * @param {number} precision - DIGIPIN precision level
 * @returns {Array<string>} Array of DIGIPINs covering the area
 */
function generateGrid(bounds, precision = 6) {
  const { north, south, east, west } = bounds;
  
  if (south >= north || west >= east) {
    throw new Error('Invalid bounding box coordinates');
  }
  
  // Validate bounds are within DIGIPIN coverage area
  if (south < BOUNDS.minLat || north > BOUNDS.maxLat ||
      west < BOUNDS.minLon || east > BOUNDS.maxLon) {
    throw new Error('Bounding box extends outside DIGIPIN coverage area');
  }
  
  const digipins = new Set();
  
  // Calculate grid cell size for the precision level
  // Start with the full bounds and divide by 4 for each level
  let cellSize = 36; // Initial 36-degree bounds
  for (let i = 1; i < precision; i++) {
    cellSize /= 4;
  }
  
  // Generate grid points
  const latStart = Math.floor(south / cellSize) * cellSize;
  const lonStart = Math.floor(west / cellSize) * cellSize;
  
  for (let lat = latStart; lat <= north; lat += cellSize) {
    for (let lon = lonStart; lon <= east; lon += cellSize) {
      if (lat >= BOUNDS.minLat && lat <= BOUNDS.maxLat &&
          lon >= BOUNDS.minLon && lon <= BOUNDS.maxLon) {
        try {
          const digipin = encode(lat, lon, precision);
          digipins.add(digipin);
        } catch (error) {
          // Skip invalid coordinates
        }
      }
    }
  }
  
  return Array.from(digipins);
}

/**
 * Generate a grid along a line between two points
 * @param {number} lat1 - Start latitude
 * @param {number} lon1 - Start longitude
 * @param {number} lat2 - End latitude
 * @param {number} lon2 - End longitude
 * @param {number} precision - DIGIPIN precision level
 * @param {number} steps - Number of interpolation steps
 * @returns {Array<string>} Array of DIGIPINs along the line
 */
function generateLineGrid(lat1, lon1, lat2, lon2, precision = 6, steps = 100) {
  const digipins = new Set();
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = lat1 + t * (lat2 - lat1);
    const lon = lon1 + t * (lon2 - lon1);
    
    if (lat >= BOUNDS.minLat && lat <= BOUNDS.maxLat &&
        lon >= BOUNDS.minLon && lon <= BOUNDS.maxLon) {
      try {
        const digipin = encode(lat, lon, precision);
        digipins.add(digipin);
      } catch (error) {
        // Skip invalid coordinates
      }
    }
  }
  
  return Array.from(digipins);
}

/**
 * Generate a circular grid around a center point
 * @param {number} centerLat - Center latitude
 * @param {number} centerLon - Center longitude
 * @param {number} radiusKm - Radius in kilometers
 * @param {number} precision - DIGIPIN precision level
 * @returns {Array<string>} Array of DIGIPINs within the circle
 */
function generateCircularGrid(centerLat, centerLon, radiusKm, precision = 6) {
  const radiusDegrees = radiusKm / 111; // Approximate conversion
  
  const bounds = {
    north: centerLat + radiusDegrees,
    south: centerLat - radiusDegrees,
    east: centerLon + radiusDegrees,
    west: centerLon - radiusDegrees
  };
  
  const gridDigipins = generateGrid(bounds, precision);
  
  // Filter to only include DIGIPINs within the circle
  return gridDigipins.filter(digipin => {
    const decoded = decode(digipin);
    const distance = Math.sqrt(
      Math.pow(decoded.latitude - centerLat, 2) + 
      Math.pow(decoded.longitude - centerLon, 2)
    ) * 111; // Convert to approximate km
    
    return distance <= radiusKm;
  });
}

/**
 * Generate a grid for a polygon defined by vertices
 * @param {Array<{lat: number, lon: number}>} vertices - Polygon vertices
 * @param {number} precision - DIGIPIN precision level
 * @returns {Array<string>} Array of DIGIPINs within the polygon
 */
function generatePolygonGrid(vertices, precision = 6) {
  if (vertices.length < 3) {
    throw new Error('Polygon must have at least 3 vertices');
  }
  
  // Find bounding box of polygon
  let minLat = Infinity, maxLat = -Infinity;
  let minLon = Infinity, maxLon = -Infinity;
  
  vertices.forEach(vertex => {
    minLat = Math.min(minLat, vertex.lat);
    maxLat = Math.max(maxLat, vertex.lat);
    minLon = Math.min(minLon, vertex.lon);
    maxLon = Math.max(maxLon, vertex.lon);
  });
  
  const bounds = {
    north: maxLat,
    south: minLat,
    east: maxLon,
    west: minLon
  };
  
  const gridDigipins = generateGrid(bounds, precision);
  
  // Filter to only include DIGIPINs within the polygon
  return gridDigipins.filter(digipin => {
    const decoded = decode(digipin);
    return isPointInPolygon(decoded.latitude, decoded.longitude, vertices);
  });
}

/**
 * Check if a point is inside a polygon using ray casting algorithm
 * @param {number} lat - Point latitude
 * @param {number} lon - Point longitude
 * @param {Array<{lat: number, lon: number}>} vertices - Polygon vertices
 * @returns {boolean} True if point is inside polygon
 */
function isPointInPolygon(lat, lon, vertices) {
  let inside = false;
  
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].lon;
    const yi = vertices[i].lat;
    const xj = vertices[j].lon;
    const yj = vertices[j].lat;
    
    if (((yi > lat) !== (yj > lat)) && 
        (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
}

/**
 * Generate a sparse grid with specified density
 * @param {Object} bounds - Bounding box {north, south, east, west}
 * @param {number} precision - DIGIPIN precision level
 * @param {number} density - Density factor (0-1, where 1 is full grid)
 * @returns {Array<string>} Array of DIGIPINs
 */
function generateSparseGrid(bounds, precision = 6, density = 0.1) {
  if (density <= 0 || density > 1) {
    throw new Error('Density must be between 0 and 1');
  }
  
  const fullGrid = generateGrid(bounds, precision);
  const sampleSize = Math.floor(fullGrid.length * density);
  
  // Randomly sample from the full grid
  const shuffled = [...fullGrid].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, sampleSize);
}

/**
 * Generate a systematic grid with regular spacing
 * @param {Object} bounds - Bounding box {north, south, east, west}
 * @param {number} precision - DIGIPIN precision level
 * @param {number} spacing - Spacing between grid points (1 = every point, 2 = every other point, etc.)
 * @returns {Array<string>} Array of DIGIPINs
 */
function generateSystematicGrid(bounds, precision = 6, spacing = 2) {
  if (spacing < 1) {
    throw new Error('Spacing must be at least 1');
  }
  
  const fullGrid = generateGrid(bounds, precision);
  
  // Create a systematic sample
  const systematicGrid = [];
  for (let i = 0; i < fullGrid.length; i += spacing) {
    systematicGrid.push(fullGrid[i]);
  }
  
  return systematicGrid;
}

/**
 * Generate a hierarchical grid with multiple precision levels
 * @param {Object} bounds - Bounding box {north, south, east, west}
 * @param {Array<number>} precisionLevels - Array of precision levels
 * @returns {Object} Object with grids for each precision level
 */
function generateHierarchicalGrid(bounds, precisionLevels = [4, 6, 8]) {
  const grids = {};
  
  precisionLevels.forEach(precision => {
    grids[precision] = generateGrid(bounds, precision);
  });
  
  return grids;
}

module.exports = {
  generateGrid,
  generateLineGrid,
  generateCircularGrid,
  generatePolygonGrid,
  generateSparseGrid,
  generateSystematicGrid,
  generateHierarchicalGrid,
  isPointInPolygon
};
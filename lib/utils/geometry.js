/**
 * Geometric Operations for DIGIPIN
 * Area calculations, bounding boxes, and geometric utilities
 */

const { EARTH_RADIUS } = require('../core/constants');
const { decode } = require('../core/decoder');
const { toRadians, toDegrees } = require('./distance');

/**
 * Calculate area of a DIGIPIN region in square meters
 * @param {string} digipin - DIGIPIN code
 * @returns {number} Area in square meters
 */
function digipinArea(digipin) {
  const decoded = decode(digipin);
  const bounds = decoded.bounds;
  
  // Convert degrees to meters at the given latitude
  const latMeters = (bounds.north - bounds.south) * 111000; // ~111km per degree
  const lonMeters = (bounds.east - bounds.west) * 111000 * Math.cos(toRadians(decoded.latitude));
  
  return latMeters * lonMeters;
}

/**
 * Calculate the perimeter of a DIGIPIN region
 * @param {string} digipin - DIGIPIN code
 * @returns {number} Perimeter in meters
 */
function digipinPerimeter(digipin) {
  const decoded = decode(digipin);
  const bounds = decoded.bounds;
  
  const latMeters = (bounds.north - bounds.south) * 111000;
  const lonMeters = (bounds.east - bounds.west) * 111000 * Math.cos(toRadians(decoded.latitude));
  
  return 2 * (latMeters + lonMeters);
}

/**
 * Get bounding box for multiple DIGIPINs
 * @param {Array<string>} digipins - Array of DIGIPIN codes
 * @returns {Object} Bounding box coordinates
 */
function getBoundingBox(digipins) {
  if (!Array.isArray(digipins) || digipins.length === 0) {
    throw new Error('DIGIPINs array cannot be empty');
  }

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLon = Infinity;
  let maxLon = -Infinity;

  digipins.forEach(digipin => {
    const decoded = decode(digipin);
    const bounds = decoded.bounds;
    
    minLat = Math.min(minLat, bounds.south);
    maxLat = Math.max(maxLat, bounds.north);
    minLon = Math.min(minLon, bounds.west);
    maxLon = Math.max(maxLon, bounds.east);
  });

  return {
    north: maxLat,
    south: minLat,
    east: maxLon,
    west: minLon,
    center: {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLon + maxLon) / 2
    }
  };
}

/**
 * Check if a point is inside a DIGIPIN region
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} digipin - DIGIPIN code
 * @returns {boolean} True if point is inside
 */
function isPointInDigipin(lat, lon, digipin) {
  const decoded = decode(digipin);
  const bounds = decoded.bounds;
  
  return lat >= bounds.south && lat <= bounds.north &&
         lon >= bounds.west && lon <= bounds.east;
}

/**
 * Check if two DIGIPIN regions intersect
 * @param {string} digipin1 - First DIGIPIN
 * @param {string} digipin2 - Second DIGIPIN
 * @returns {boolean} True if regions intersect
 */
function digipinsIntersect(digipin1, digipin2) {
  const decoded1 = decode(digipin1);
  const decoded2 = decode(digipin2);
  
  const bounds1 = decoded1.bounds;
  const bounds2 = decoded2.bounds;
  
  return !(bounds1.east < bounds2.west || bounds2.east < bounds1.west ||
           bounds1.north < bounds2.south || bounds2.north < bounds1.south);
}

/**
 * Calculate intersection area of two DIGIPIN regions
 * @param {string} digipin1 - First DIGIPIN
 * @param {string} digipin2 - Second DIGIPIN
 * @returns {number} Intersection area in square meters, 0 if no intersection
 */
function digipinIntersectionArea(digipin1, digipin2) {
  if (!digipinsIntersect(digipin1, digipin2)) {
    return 0;
  }

  const decoded1 = decode(digipin1);
  const decoded2 = decode(digipin2);
  
  const bounds1 = decoded1.bounds;
  const bounds2 = decoded2.bounds;
  
  const intersectionBounds = {
    north: Math.min(bounds1.north, bounds2.north),
    south: Math.max(bounds1.south, bounds2.south),
    east: Math.min(bounds1.east, bounds2.east),
    west: Math.max(bounds1.west, bounds2.west)
  };
  
  const centerLat = (intersectionBounds.north + intersectionBounds.south) / 2;
  const latMeters = (intersectionBounds.north - intersectionBounds.south) * 111000;
  const lonMeters = (intersectionBounds.east - intersectionBounds.west) * 111000 * Math.cos(toRadians(centerLat));
  
  return latMeters * lonMeters;
}

/**
 * Generate polygon coordinates for a DIGIPIN region
 * @param {string} digipin - DIGIPIN code
 * @returns {Array<Array<number>>} Array of [longitude, latitude] coordinates
 */
function digipinPolygon(digipin) {
  const decoded = decode(digipin);
  const bounds = decoded.bounds;
  
  return [
    [bounds.west, bounds.south],   // SW
    [bounds.east, bounds.south],   // SE
    [bounds.east, bounds.north],   // NE
    [bounds.west, bounds.north],   // NW
    [bounds.west, bounds.south]    // Close polygon
  ];
}

/**
 * Check if a DIGIPIN is completely contained within another
 * @param {string} innerDigipin - Inner DIGIPIN
 * @param {string} outerDigipin - Outer DIGIPIN
 * @returns {boolean} True if inner is contained within outer
 */
function digipinContains(outerDigipin, innerDigipin) {
  const outer = decode(outerDigipin);
  const inner = decode(innerDigipin);
  
  const outerBounds = outer.bounds;
  const innerBounds = inner.bounds;
  
  return innerBounds.south >= outerBounds.south &&
         innerBounds.north <= outerBounds.north &&
         innerBounds.west >= outerBounds.west &&
         innerBounds.east <= outerBounds.east;
}

/**
 * Calculate the convex hull of DIGIPIN centers
 * @param {Array<string>} digipins - Array of DIGIPIN codes
 * @returns {Array<Object>} Convex hull vertices as {latitude, longitude}
 */
function digipinConvexHull(digipins) {
  if (digipins.length < 3) {
    throw new Error('Need at least 3 DIGIPINs for convex hull');
  }

  const points = digipins.map(digipin => {
    const decoded = decode(digipin);
    return { latitude: decoded.latitude, longitude: decoded.longitude };
  });

  // Graham scan algorithm for convex hull
  // Find the point with the lowest y-coordinate (and leftmost if tie)
  let start = points[0];
  let startIndex = 0;
  
  for (let i = 1; i < points.length; i++) {
    if (points[i].latitude < start.latitude || 
        (points[i].latitude === start.latitude && points[i].longitude < start.longitude)) {
      start = points[i];
      startIndex = i;
    }
  }

  // Sort points by polar angle with respect to start point
  const sortedPoints = points.filter((_, i) => i !== startIndex);
  sortedPoints.sort((a, b) => {
    const angleA = Math.atan2(a.latitude - start.latitude, a.longitude - start.longitude);
    const angleB = Math.atan2(b.latitude - start.latitude, b.longitude - start.longitude);
    return angleA - angleB;
  });

  // Build convex hull
  const hull = [start];
  
  for (const point of sortedPoints) {
    while (hull.length > 1) {
      const o1 = hull[hull.length - 2];
      const o2 = hull[hull.length - 1];
      
      // Cross product to determine turn direction
      const cross = (o2.longitude - o1.longitude) * (point.latitude - o1.latitude) -
                   (o2.latitude - o1.latitude) * (point.longitude - o1.longitude);
      
      if (cross <= 0) {
        hull.pop();
      } else {
        break;
      }
    }
    hull.push(point);
  }

  return hull;
}

module.exports = {
  digipinArea,
  digipinPerimeter,
  getBoundingBox,
  isPointInDigipin,
  digipinsIntersect,
  digipinIntersectionArea,
  digipinPolygon,
  digipinContains,
  digipinConvexHull
};
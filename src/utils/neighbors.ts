/**
 * Neighbor discovery utilities for DIGIPIN grids
 */

import { 
  DigipinString, 
  GridCell, 
  NeighborOptions, 
  Coordinates 
} from '../types';
import { 
  decode, 
  encode, 
  sanitizeDigipin, 
  getBounds, 
  getGridCell 
} from '../core/codec';
import { DIGIPIN_GRID } from '../core/constants';

/**
 * Gets the neighbors of a DIGIPIN at the same precision level
 * @param digipin - Central DIGIPIN
 * @param options - Neighbor discovery options
 * @returns Array of neighboring GridCells
 */
export function getNeighbors(
  digipin: DigipinString, 
  options: NeighborOptions = {}
): GridCell[] {
  const opts = {
    includeDiagonals: true,
    maxDistance: 1,
    ...options
  };
  
  const cleanPin = sanitizeDigipin(digipin);
  const bounds = getBounds(cleanPin);
  const center = decode(cleanPin);
  const level = cleanPin.length;
  
  // Calculate grid cell dimensions
  const latDiv = (bounds.maxLat - bounds.minLat);
  const lonDiv = (bounds.maxLon - bounds.minLon);
  
  const neighbors: GridCell[] = [];
  
  // Generate neighbor offsets based on options
  const offsets: Array<[number, number]> = [];
  
  for (let latOffset = -opts.maxDistance!; latOffset <= opts.maxDistance!; latOffset++) {
    for (let lonOffset = -opts.maxDistance!; lonOffset <= opts.maxDistance!; lonOffset++) {
      // Skip the center cell
      if (latOffset === 0 && lonOffset === 0) continue;
      
      // Skip diagonal neighbors if not requested
      if (!opts.includeDiagonals && latOffset !== 0 && lonOffset !== 0) continue;
      
      offsets.push([latOffset, lonOffset]);
    }
  }
  
  // Generate neighbor coordinates and DIGIPINs
  for (const [latOffset, lonOffset] of offsets) {
    const neighborLat = center.latitude + (latOffset * latDiv);
    const neighborLon = center.longitude + (lonOffset * lonDiv);
    
    // Check if neighbor is within India bounds
    try {
      const neighborDigipin = encode(neighborLat, neighborLon);
      const neighborCell = getGridCell(neighborDigipin);
      
      // Apply filter if provided
      if (!opts.filter || opts.filter(neighborCell)) {
        neighbors.push(neighborCell);
      }
    } catch {
      // Neighbor is outside valid bounds, skip it
      continue;
    }
  }
  
  return neighbors;
}

/**
 * Gets the adjacent neighbors (north, south, east, west) of a DIGIPIN
 * @param digipin - Central DIGIPIN
 * @returns Array of adjacent GridCells
 */
export function getAdjacentNeighbors(digipin: DigipinString): GridCell[] {
  return getNeighbors(digipin, { 
    includeDiagonals: false, 
    maxDistance: 1 
  });
}

/**
 * Gets all neighbors including diagonals
 * @param digipin - Central DIGIPIN
 * @returns Array of all neighboring GridCells
 */
export function getAllNeighbors(digipin: DigipinString): GridCell[] {
  return getNeighbors(digipin, { 
    includeDiagonals: true, 
    maxDistance: 1 
  });
}

/**
 * Gets neighbors within a specified radius
 * @param digipin - Central DIGIPIN
 * @param radius - Radius in grid cells
 * @returns Array of neighboring GridCells within radius
 */
export function getNeighborsInRadius(digipin: DigipinString, radius: number): GridCell[] {
  return getNeighbors(digipin, { 
    includeDiagonals: true, 
    maxDistance: Math.max(1, Math.floor(radius))
  });
}

/**
 * Gets the parent DIGIPIN (one level up in hierarchy)
 * @param digipin - Child DIGIPIN
 * @returns Parent DIGIPIN or null if already at top level
 */
export function getParentDigipin(digipin: DigipinString): DigipinString | null {
  const cleanPin = sanitizeDigipin(digipin);
  
  if (cleanPin.length <= 1) {
    return null; // Already at top level
  }
  
  const parentPin = cleanPin.slice(0, -1);
  const coords = decode(cleanPin);
  
  // Re-encode at parent level to get properly formatted parent
  const parentCoords = decode(parentPin);
  return encode(parentCoords.latitude, parentCoords.longitude);
}

/**
 * Gets the children DIGIPINs (one level down in hierarchy)
 * @param digipin - Parent DIGIPIN
 * @returns Array of child DIGIPINs
 */
export function getChildrenDigipins(digipin: DigipinString): DigipinString[] {
  const cleanPin = sanitizeDigipin(digipin);
  
  if (cleanPin.length >= 10) {
    return []; // Already at maximum precision
  }
  
  const bounds = getBounds(cleanPin);
  const latDiv = (bounds.maxLat - bounds.minLat) / 4;
  const lonDiv = (bounds.maxLon - bounds.minLon) / 4;
  
  const children: DigipinString[] = [];
  
  // Generate all 16 possible children
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const childLat = bounds.maxLat - latDiv * (row + 0.5);
      const childLon = bounds.minLon + lonDiv * (col + 0.5);
      
      try {
        const childDigipin = encode(childLat, childLon);
        children.push(childDigipin);
      } catch {
        // Child is outside valid bounds, skip it
        continue;
      }
    }
  }
  
  return children;
}

/**
 * Gets all DIGIPINs at a specific precision level within a bounding box
 * @param bounds - Bounding box to search within
 * @param level - Precision level (1-10)
 * @returns Array of DIGIPINs within the bounds at specified level
 */
export function getDigipinsInBounds(
  bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number },
  level: number = 10
): DigipinString[] {
  const digipins: DigipinString[] = [];
  
  // Calculate approximate grid size at this level
  const latRange = bounds.maxLat - bounds.minLat;
  const lonRange = bounds.maxLon - bounds.minLon;
  
  // Sample points across the bounding box
  const latSteps = Math.max(1, Math.ceil(latRange * Math.pow(4, level - 1)));
  const lonSteps = Math.max(1, Math.ceil(lonRange * Math.pow(4, level - 1)));
  
  const seenDigipins = new Set<string>();
  
  for (let i = 0; i <= latSteps; i++) {
    for (let j = 0; j <= lonSteps; j++) {
      const lat = bounds.minLat + (latRange * i / latSteps);
      const lon = bounds.minLon + (lonRange * j / lonSteps);
      
      try {
        const fullDigipin = encode(lat, lon, { format: false });
        const levelDigipin = fullDigipin.slice(0, level);
        
        if (!seenDigipins.has(levelDigipin)) {
          seenDigipins.add(levelDigipin);
          
          // Format the DIGIPIN properly
          const coords = decode(levelDigipin);
          const formattedDigipin = encode(coords.latitude, coords.longitude);
          digipins.push(formattedDigipin);
        }
      } catch {
        // Point is outside valid bounds, skip it
        continue;
      }
    }
  }
  
  return digipins;
}

/**
 * Finds the nearest DIGIPIN to given coordinates at a specific precision level
 * @param coordinates - Target coordinates
 * @param level - Precision level (1-10)
 * @returns Nearest DIGIPIN
 */
export function findNearestDigipin(coordinates: Coordinates, level: number = 10): DigipinString {
  const fullDigipin = encode(coordinates.latitude, coordinates.longitude, { format: false });
  const levelDigipin = fullDigipin.slice(0, level);
  const coords = decode(levelDigipin);
  return encode(coords.latitude, coords.longitude);
}
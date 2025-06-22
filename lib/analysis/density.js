/**
 * DIGIPIN Density Analysis
 * Statistical analysis of DIGIPIN distributions and density patterns
 */

const { decode } = require('../core/decoder');
const { haversineDistance } = require('../utils/distance');
const { generateGrid } = require('../utils/grid');

/**
 * Calculate density statistics for DIGIPINs in a region
 * @param {Array<string>} digipins - Array of DIGIPIN codes
 * @param {Object} bounds - Bounding box {north, south, east, west}
 * @param {number} gridPrecision - Grid precision for density calculation
 * @returns {Object} Density statistics
 */
function calculateDensity(digipins, bounds, gridPrecision = 6) {
  if (!Array.isArray(digipins) || digipins.length === 0) {
    throw new Error('DIGIPINs array cannot be empty');
  }

  // Generate reference grid for the area
  const referenceGrid = generateGrid(bounds, gridPrecision);
  const totalCells = referenceGrid.length;
  
  // Count DIGIPINs per grid cell
  const densityMap = {};
  const occupiedCells = new Set();
  
  digipins.forEach(digipin => {
    const cleanPin = digipin.replace(/-/g, '');
    const gridKey = cleanPin.substring(0, gridPrecision);
    
    if (!densityMap[gridKey]) {
      densityMap[gridKey] = 0;
    }
    
    densityMap[gridKey]++;
    occupiedCells.add(gridKey);
  });
  
  const densityValues = Object.values(densityMap);
  const occupiedCellCount = occupiedCells.size;
  
  // Calculate statistics
  const totalDigipins = digipins.length;
  const meanDensity = totalDigipins / occupiedCellCount;
  const maxDensity = Math.max(...densityValues);
  const minDensity = Math.min(...densityValues);
  
  // Calculate variance and standard deviation
  const variance = densityValues.reduce((sum, density) => 
    sum + Math.pow(density - meanDensity, 2), 0) / densityValues.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Coverage percentage
  const coverage = (occupiedCellCount / totalCells) * 100;
  
  // Calculate area statistics
  const totalArea = (bounds.north - bounds.south) * (bounds.east - bounds.west);
  const averageArea = totalArea / totalCells;
  const densityPerSqDegree = totalDigipins / totalArea;
  
  return {
    total: {
      digipins: totalDigipins,
      cells: totalCells,
      occupiedCells: occupiedCellCount,
      coverage: coverage
    },
    density: {
      mean: meanDensity,
      median: calculateMedian(densityValues),
      mode: calculateMode(densityValues),
      max: maxDensity,
      min: minDensity,
      standardDeviation: standardDeviation,
      variance: variance,
      perSquareDegree: densityPerSqDegree
    },
    area: {
      totalSquareDegrees: totalArea,
      averageCellArea: averageArea,
      bounds: bounds
    },
    distribution: densityMap
  };
}

/**
 * Find density hotspots in DIGIPIN data
 * @param {Array<string>} digipins - Array of DIGIPIN codes
 * @param {number} threshold - Density threshold (standard deviations above mean)
 * @param {number} gridPrecision - Grid precision for analysis
 * @returns {Array<Object>} Array of hotspot regions
 */
function findHotspots(digipins, threshold = 2, gridPrecision = 6) {
  const bounds = calculateBounds(digipins);
  const densityStats = calculateDensity(digipins, bounds, gridPrecision);
  
  const hotspotThreshold = densityStats.density.mean + 
    (threshold * densityStats.density.standardDeviation);
  
  const hotspots = [];
  
  Object.entries(densityStats.distribution).forEach(([gridKey, density]) => {
    if (density >= hotspotThreshold) {
      // Get representative coordinates for this grid cell
      const representativeDigipin = digipins.find(d => 
        d.replace(/-/g, '').startsWith(gridKey)
      );
      
      if (representativeDigipin) {
        const decoded = decode(representativeDigipin);
        hotspots.push({
          gridKey: gridKey,
          density: density,
          center: {
            latitude: decoded.latitude,
            longitude: decoded.longitude
          },
          bounds: decoded.bounds,
          significance: (density - densityStats.density.mean) / densityStats.density.standardDeviation
        });
      }
    }
  });
  
  // Sort by density (highest first)
  return hotspots.sort((a, b) => b.density - a.density);
}

/**
 * Identify cold spots (areas with unusually low density)
 * @param {Array<string>} digipins - Array of DIGIPIN codes
 * @param {number} threshold - Threshold (standard deviations below mean)
 * @param {number} gridPrecision - Grid precision for analysis
 * @returns {Array<Object>} Array of cold spot regions
 */
function findColdSpots(digipins, threshold = 1, gridPrecision = 6) {
  const bounds = calculateBounds(digipins);
  const densityStats = calculateDensity(digipins, bounds, gridPrecision);
  
  const coldSpotThreshold = Math.max(0, 
    densityStats.density.mean - (threshold * densityStats.density.standardDeviation)
  );
  
  const coldSpots = [];
  
  Object.entries(densityStats.distribution).forEach(([gridKey, density]) => {
    if (density <= coldSpotThreshold && density > 0) {
      const representativeDigipin = digipins.find(d => 
        d.replace(/-/g, '').startsWith(gridKey)
      );
      
      if (representativeDigipin) {
        const decoded = decode(representativeDigipin);
        coldSpots.push({
          gridKey: gridKey,
          density: density,
          center: {
            latitude: decoded.latitude,
            longitude: decoded.longitude
          },
          bounds: decoded.bounds,
          significance: (densityStats.density.mean - density) / densityStats.density.standardDeviation
        });
      }
    }
  });
  
  return coldSpots.sort((a, b) => a.density - b.density);
}

/**
 * Calculate spatial autocorrelation (Moran's I) for DIGIPIN density
 * @param {Array<string>} digipins - Array of DIGIPIN codes
 * @param {number} gridPrecision - Grid precision for analysis
 * @returns {Object} Spatial autocorrelation results
 */
function calculateSpatialAutocorrelation(digipins, gridPrecision = 6) {
  const bounds = calculateBounds(digipins);
  const densityStats = calculateDensity(digipins, bounds, gridPrecision);
  
  const cells = Object.keys(densityStats.distribution);
  const n = cells.length;
  const meanDensity = densityStats.density.mean;
  
  let numerator = 0;
  let denominator = 0;
  let totalWeights = 0;
  
  // Calculate Moran's I
  cells.forEach((cellI, i) => {
    const densityI = densityStats.distribution[cellI];
    const deviationI = densityI - meanDensity;
    
    cells.forEach((cellJ, j) => {
      if (i !== j) {
        const densityJ = densityStats.distribution[cellJ];
        const deviationJ = densityJ - meanDensity;
        
        // Simple adjacency weight (could be improved with actual spatial weights)
        const weight = areAdjacent(cellI, cellJ) ? 1 : 0;
        
        numerator += weight * deviationI * deviationJ;
        totalWeights += weight;
      }
    });
    
    denominator += deviationI * deviationI;
  });
  
  const moransI = totalWeights > 0 ? (n / totalWeights) * (numerator / denominator) : 0;
  
  return {
    moransI: moransI,
    interpretation: getMoransIInterpretation(moransI),
    significanceLevel: 'Not calculated', // Would need more complex calculation
    cellCount: n,
    totalWeights: totalWeights
  };
}

/**
 * Calculate nearest neighbor statistics
 * @param {Array<string>} digipins - Array of DIGIPIN codes
 * @param {number} sampleSize - Sample size for analysis (0 = all)
 * @returns {Object} Nearest neighbor statistics
 */
function calculateNearestNeighborStats(digipins, sampleSize = 0) {
  const sample = sampleSize > 0 && sampleSize < digipins.length
    ? digipins.slice(0, sampleSize)
    : digipins;
  
  const distances = [];
  
  sample.forEach(digipin => {
    const decoded = decode(digipin);
    let minDistance = Infinity;
    
    digipins.forEach(otherDigipin => {
      if (digipin !== otherDigipin) {
        const otherDecoded = decode(otherDigipin);
        const distance = haversineDistance(
          decoded.latitude, decoded.longitude,
          otherDecoded.latitude, otherDecoded.longitude
        );
        
        if (distance < minDistance) {
          minDistance = distance;
        }
      }
    });
    
    if (minDistance !== Infinity) {
      distances.push(minDistance);
    }
  });
  
  const meanDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
  const medianDistance = calculateMedian(distances);
  const maxDistance = Math.max(...distances);
  const minDistance = Math.min(...distances);
  
  return {
    meanNearestNeighborDistance: meanDistance,
    medianNearestNeighborDistance: medianDistance,
    maxNearestNeighborDistance: maxDistance,
    minNearestNeighborDistance: minDistance,
    sampleSize: sample.length,
    distributionType: classifyDistribution(distances)
  };
}

// Helper functions

function calculateMedian(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 
    ? (sorted[mid - 1] + sorted[mid]) / 2 
    : sorted[mid];
}

function calculateMode(values) {
  const frequency = {};
  let maxFreq = 0;
  let mode = values[0];
  
  values.forEach(value => {
    frequency[value] = (frequency[value] || 0) + 1;
    if (frequency[value] > maxFreq) {
      maxFreq = frequency[value];
      mode = value;
    }
  });
  
  return mode;
}

function calculateBounds(digipins) {
  let minLat = Infinity, maxLat = -Infinity;
  let minLon = Infinity, maxLon = -Infinity;
  
  digipins.forEach(digipin => {
    const decoded = decode(digipin);
    minLat = Math.min(minLat, decoded.bounds.south);
    maxLat = Math.max(maxLat, decoded.bounds.north);
    minLon = Math.min(minLon, decoded.bounds.west);
    maxLon = Math.max(maxLon, decoded.bounds.east);
  });
  
  return { north: maxLat, south: minLat, east: maxLon, west: minLon };
}

function areAdjacent(cellI, cellJ) {
  // Simple check - could be improved with actual grid adjacency logic
  return Math.abs(cellI.length - cellJ.length) <= 1;
}

function getMoransIInterpretation(moransI) {
  if (moransI > 0.3) return 'Strong positive spatial autocorrelation (clustered)';
  if (moransI > 0.1) return 'Moderate positive spatial autocorrelation';
  if (moransI > -0.1) return 'No significant spatial autocorrelation (random)';
  if (moransI > -0.3) return 'Moderate negative spatial autocorrelation';
  return 'Strong negative spatial autocorrelation (dispersed)';
}

function classifyDistribution(distances) {
  const mean = distances.reduce((sum, d) => sum + d, 0) / distances.length;
  const median = calculateMedian(distances);
  
  if (Math.abs(mean - median) / mean < 0.1) return 'Normal';
  if (mean > median) return 'Right-skewed';
  return 'Left-skewed';
}

module.exports = {
  calculateDensity,
  findHotspots,
  findColdSpots,
  calculateSpatialAutocorrelation,
  calculateNearestNeighborStats
};
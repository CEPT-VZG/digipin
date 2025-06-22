/**
 * GeoJSON Conversion Utilities
 * Convert between DIGIPIN and GeoJSON formats
 */

const { decode } = require('../core/decoder');
const { digipinPolygon } = require('../utils/geometry');

/**
 * Convert a DIGIPIN to a GeoJSON Point feature
 * @param {string} digipin - DIGIPIN code
 * @param {Object} properties - Additional properties for the feature
 * @returns {Object} GeoJSON Point feature
 */
function digipinToPoint(digipin, properties = {}) {
  const decoded = decode(digipin);
  
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [decoded.longitude, decoded.latitude]
    },
    properties: {
      digipin: digipin,
      precision: decoded.precision,
      accuracy: decoded.accuracy.approximateMeters,
      ...properties
    }
  };
}

/**
 * Convert a DIGIPIN to a GeoJSON Polygon feature (representing the DIGIPIN cell)
 * @param {string} digipin - DIGIPIN code
 * @param {Object} properties - Additional properties for the feature
 * @returns {Object} GeoJSON Polygon feature
 */
function digipinToPolygon(digipin, properties = {}) {
  const decoded = decode(digipin);
  const polygon = digipinPolygon(digipin);
  
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [polygon]
    },
    properties: {
      digipin: digipin,
      precision: decoded.precision,
      area: decoded.accuracy.latDegrees * decoded.accuracy.lonDegrees,
      center: [decoded.longitude, decoded.latitude],
      ...properties
    }
  };
}

/**
 * Convert multiple DIGIPINs to a GeoJSON FeatureCollection of points
 * @param {Array<string>} digipins - Array of DIGIPIN codes
 * @param {Object} commonProperties - Common properties for all features
 * @returns {Object} GeoJSON FeatureCollection
 */
function digipinsToPointCollection(digipins, commonProperties = {}) {
  const features = digipins.map(digipin => 
    digipinToPoint(digipin, commonProperties)
  );
  
  return {
    type: 'FeatureCollection',
    features: features
  };
}

/**
 * Convert multiple DIGIPINs to a GeoJSON FeatureCollection of polygons
 * @param {Array<string>} digipins - Array of DIGIPIN codes
 * @param {Object} commonProperties - Common properties for all features
 * @returns {Object} GeoJSON FeatureCollection
 */
function digipinsToPolygonCollection(digipins, commonProperties = {}) {
  const features = digipins.map(digipin => 
    digipinToPolygon(digipin, commonProperties)
  );
  
  return {
    type: 'FeatureCollection',
    features: features
  };
}

/**
 * Convert clustered DIGIPINs to GeoJSON with cluster information
 * @param {Object} clusters - Clustering result from clustering algorithms
 * @param {string} geometryType - 'Point' or 'Polygon'
 * @returns {Object} GeoJSON FeatureCollection with cluster properties
 */
function clustersToGeoJSON(clusters, geometryType = 'Point') {
  const features = [];
  
  Object.entries(clusters).forEach(([clusterIndex, digipins]) => {
    digipins.forEach(digipin => {
      const feature = geometryType === 'Point' 
        ? digipinToPoint(digipin, { cluster: parseInt(clusterIndex) })
        : digipinToPolygon(digipin, { cluster: parseInt(clusterIndex) });
      
      features.push(feature);
    });
  });
  
  return {
    type: 'FeatureCollection',
    features: features
  };
}

/**
 * Convert GeoJSON Point features to DIGIPINs
 * @param {Object} geojson - GeoJSON FeatureCollection or Feature
 * @param {number} precision - DIGIPIN precision level
 * @returns {Array<Object>} Array of objects with digipin and original properties
 */
function pointsToDigipins(geojson, precision = 10) {
  const { encode } = require('../core/encoder');
  
  let features = [];
  
  if (geojson.type === 'FeatureCollection') {
    features = geojson.features;
  } else if (geojson.type === 'Feature') {
    features = [geojson];
  } else {
    throw new Error('Input must be a GeoJSON Feature or FeatureCollection');
  }
  
  return features
    .filter(feature => feature.geometry.type === 'Point')
    .map(feature => {
      const [lon, lat] = feature.geometry.coordinates;
      const digipin = encode(lat, lon, precision);
      
      return {
        digipin: digipin,
        originalProperties: feature.properties || {},
        coordinates: { latitude: lat, longitude: lon }
      };
    });
}

/**
 * Create a GeoJSON LineString from a series of DIGIPINs
 * @param {Array<string>} digipins - Array of DIGIPIN codes in order
 * @param {Object} properties - Properties for the LineString
 * @returns {Object} GeoJSON LineString feature
 */
function digipinsToLineString(digipins, properties = {}) {
  const coordinates = digipins.map(digipin => {
    const decoded = decode(digipin);
    return [decoded.longitude, decoded.latitude];
  });
  
  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: coordinates
    },
    properties: {
      digipinCount: digipins.length,
      startDigipin: digipins[0],
      endDigipin: digipins[digipins.length - 1],
      ...properties
    }
  };
}

/**
 * Create a GeoJSON MultiPolygon from clustered DIGIPINs
 * @param {Object} clusters - Clustering result
 * @returns {Object} GeoJSON MultiPolygon feature for each cluster
 */
function clustersToMultiPolygon(clusters) {
  const features = [];
  
  Object.entries(clusters).forEach(([clusterIndex, digipins]) => {
    const polygons = digipins.map(digipin => {
      const polygon = digipinPolygon(digipin);
      return [polygon];
    });
    
    features.push({
      type: 'Feature',
      geometry: {
        type: 'MultiPolygon',
        coordinates: polygons
      },
      properties: {
        cluster: parseInt(clusterIndex),
        digipinCount: digipins.length,
        digipins: digipins
      }
    });
  });
  
  return {
    type: 'FeatureCollection',
    features: features
  };
}

/**
 * Create a heatmap-style GeoJSON with DIGIPIN density information
 * @param {Array<string>} digipins - Array of DIGIPIN codes
 * @param {number} gridPrecision - Precision for density grid
 * @returns {Object} GeoJSON FeatureCollection with density information
 */
function createDensityGeoJSON(digipins, gridPrecision = 6) {
  const densityMap = {};
  
  // Count DIGIPINs per grid cell
  digipins.forEach(digipin => {
    const cleanPin = digipin.replace(/-/g, '');
    const gridKey = cleanPin.substring(0, gridPrecision);
    
    if (!densityMap[gridKey]) {
      densityMap[gridKey] = { count: 0, digipins: [] };
    }
    
    densityMap[gridKey].count++;
    densityMap[gridKey].digipins.push(digipin);
  });
  
  // Convert to GeoJSON features
  const features = Object.entries(densityMap).map(([gridKey, data]) => {
    // Use first DIGIPIN as representative for the grid cell
    const representative = data.digipins[0];
    return digipinToPolygon(representative, {
      density: data.count,
      digipinCount: data.count,
      gridKey: gridKey
    });
  });
  
  return {
    type: 'FeatureCollection',
    features: features
  };
}

/**
 * Validate GeoJSON structure
 * @param {Object} geojson - GeoJSON object to validate
 * @returns {Object} Validation result
 */
function validateGeoJSON(geojson) {
  const result = {
    isValid: true,
    errors: [],
    warnings: []
  };
  
  if (!geojson || typeof geojson !== 'object') {
    result.isValid = false;
    result.errors.push('GeoJSON must be an object');
    return result;
  }
  
  const validTypes = ['Feature', 'FeatureCollection', 'Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection'];
  
  if (!validTypes.includes(geojson.type)) {
    result.isValid = false;
    result.errors.push(`Invalid GeoJSON type: ${geojson.type}`);
  }
  
  if (geojson.type === 'FeatureCollection') {
    if (!Array.isArray(geojson.features)) {
      result.isValid = false;
      result.errors.push('FeatureCollection must have features array');
    }
  }
  
  if (geojson.type === 'Feature') {
    if (!geojson.geometry || !geojson.geometry.type) {
      result.isValid = false;
      result.errors.push('Feature must have geometry with type');
    }
  }
  
  return result;
}

module.exports = {
  digipinToPoint,
  digipinToPolygon,
  digipinsToPointCollection,
  digipinsToPolygonCollection,
  clustersToGeoJSON,
  pointsToDigipins,
  digipinsToLineString,
  clustersToMultiPolygon,
  createDensityGeoJSON,
  validateGeoJSON
};
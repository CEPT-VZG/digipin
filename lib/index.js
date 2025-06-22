/**
 * DIGIPIN Plus - Main Entry Point
 * Comprehensive DIGIPIN library with advanced features
 */

// Core modules
const encoder = require('./core/encoder');
const decoder = require('./core/decoder');
const validator = require('./core/validator');

// Utility modules
const distance = require('./utils/distance');
const geometry = require('./utils/geometry');
const neighbors = require('./utils/neighbors');
const grid = require('./utils/grid');
const clustering = require('./utils/clustering');

// Integration modules
const geojson = require('./integrations/geojson');

// Analysis modules
const density = require('./analysis/density');

/**
 * Main DigipinPlus class providing comprehensive DIGIPIN functionality
 */
class DigipinPlus {
  constructor() {
    this.version = '1.0.0';
  }

  // Core functionality
  encode(lat, lon, precision = 10) {
    return encoder.encode(lat, lon, precision);
  }

  decode(digiPin) {
    return decoder.decode(digiPin);
  }

  validate(digiPin, options = {}) {
    return validator.validate(digiPin, options);
  }

  // Batch operations
  encodeBatch(coordinates) {
    return encoder.encodeBatch(coordinates);
  }

  decodeBatch(digipins) {
    return decoder.decodeBatch(digipins);
  }

  // Distance calculations
  distance(digipin1, digipin2) {
    return distance.digipinDistance(digipin1, digipin2);
  }

  bearing(digipin1, digipin2) {
    return distance.digipinBearing(digipin1, digipin2);
  }

  midpoint(digipin1, digipin2) {
    return distance.digipinMidpoint(digipin1, digipin2);
  }

  // Geometric operations
  area(digipin) {
    return geometry.digipinArea(digipin);
  }

  perimeter(digipin) {
    return geometry.digipinPerimeter(digipin);
  }

  polygon(digipin) {
    return geometry.digipinPolygon(digipin);
  }

  intersects(digipin1, digipin2) {
    return geometry.digipinsIntersect(digipin1, digipin2);
  }

  contains(outerDigipin, innerDigipin) {
    return geometry.digipinContains(outerDigipin, innerDigipin);
  }

  // Neighbor operations
  neighbors(digipin, radius = 1) {
    return radius === 1 
      ? neighbors.getNeighbors(digipin)
      : neighbors.getNeighborsInRadius(digipin, radius);
  }

  children(digipin) {
    return neighbors.getChildren(digipin);
  }

  parent(digipin) {
    return neighbors.getParent(digipin);
  }

  siblings(digipin) {
    return neighbors.getSiblings(digipin);
  }

  // Grid operations
  generateGrid(bounds, precision = 6) {
    return grid.generateGrid(bounds, precision);
  }

  generateCircularGrid(centerLat, centerLon, radiusKm, precision = 6) {
    return grid.generateCircularGrid(centerLat, centerLon, radiusKm, precision);
  }

  generatePolygonGrid(vertices, precision = 6) {
    return grid.generatePolygonGrid(vertices, precision);
  }

  // Clustering
  cluster(digipins, method = 'kmeans', options = {}) {
    switch (method.toLowerCase()) {
      case 'kmeans':
        return clustering.kMeansClustering(digipins, options.k || 3, options.maxIterations || 100);
      case 'dbscan':
        return clustering.dbscanClustering(digipins, options.epsilon || 1000, options.minPoints || 3);
      case 'hierarchical':
        return clustering.hierarchicalClustering(digipins, options.threshold || 5000);
      case 'grid':
        return clustering.gridBasedClustering(digipins, options.precision || 6);
      default:
        throw new Error(`Unknown clustering method: ${method}`);
    }
  }

  // GeoJSON conversion
  toGeoJSON(digipins, type = 'point', properties = {}) {
    if (Array.isArray(digipins)) {
      return type === 'polygon'
        ? geojson.digipinsToPolygonCollection(digipins, properties)
        : geojson.digipinsToPointCollection(digipins, properties);
    } else {
      return type === 'polygon'
        ? geojson.digipinToPolygon(digipins, properties)
        : geojson.digipinToPoint(digipins, properties);
    }
  }

  fromGeoJSON(geojsonData, precision = 10) {
    return geojson.pointsToDigipins(geojsonData, precision);
  }

  // Analysis
  analyzeDensity(digipins, bounds, gridPrecision = 6) {
    return density.calculateDensity(digipins, bounds, gridPrecision);
  }

  findHotspots(digipins, threshold = 2, gridPrecision = 6) {
    return density.findHotspots(digipins, threshold, gridPrecision);
  }

  findColdSpots(digipins, threshold = 1, gridPrecision = 6) {
    return density.findColdSpots(digipins, threshold, gridPrecision);
  }

  // Utility methods
  getBounds(digipins) {
    return geometry.getBoundingBox(digipins);
  }

  isValid(digipin) {
    return validator.isValid(digipin);
  }

  getAccuracy(precision) {
    return validator.getEstimatedAccuracy(precision);
  }

  // Chaining methods for fluent API
  from(lat, lon, precision) {
    this._currentDigipin = this.encode(lat, lon, precision);
    return this;
  }

  to(digipin) {
    this._currentDigipin = digipin;
    return this;
  }

  getDistance(otherDigipin) {
    if (!this._currentDigipin) throw new Error('No current DIGIPIN set');
    return this.distance(this._currentDigipin, otherDigipin);
  }

  getNeighbors(radius = 1) {
    if (!this._currentDigipin) throw new Error('No current DIGIPIN set');
    return this.neighbors(this._currentDigipin, radius);
  }

  getArea() {
    if (!this._currentDigipin) throw new Error('No current DIGIPIN set');
    return this.area(this._currentDigipin);
  }
}

// Create default instance
const digipinPlus = new DigipinPlus();

// Export the default instance with all methods
module.exports = digipinPlus;

// Named exports for tree-shaking
module.exports.DigipinPlus = DigipinPlus;
module.exports.default = digipinPlus;

// Core functions
module.exports.encode = encoder.encode;
module.exports.decode = decoder.decode;
module.exports.validate = validator.validate;
module.exports.isValid = validator.isValid;
module.exports.encodeBatch = encoder.encodeBatch;
module.exports.decodeBatch = decoder.decodeBatch;

// Utility functions
module.exports.distance = distance.digipinDistance;
module.exports.bearing = distance.digipinBearing;
module.exports.midpoint = distance.digipinMidpoint;
module.exports.area = geometry.digipinArea;
module.exports.perimeter = geometry.digipinPerimeter;
module.exports.polygon = geometry.digipinPolygon;
module.exports.getBounds = geometry.getBoundingBox;
module.exports.neighbors = neighbors.getNeighbors;
module.exports.children = neighbors.getChildren;
module.exports.parent = neighbors.getParent;

// Grid functions
module.exports.generateGrid = grid.generateGrid;
module.exports.generateCircularGrid = grid.generateCircularGrid;
module.exports.generatePolygonGrid = grid.generatePolygonGrid;

// Clustering functions
module.exports.cluster = digipinPlus.cluster.bind(digipinPlus);
module.exports.kMeansCluster = clustering.kMeansClustering;
module.exports.dbscanCluster = clustering.dbscanClustering;
module.exports.hierarchicalCluster = clustering.hierarchicalClustering;
module.exports.gridCluster = clustering.gridBasedClustering;

// GeoJSON functions
module.exports.toGeoJSON = digipinPlus.toGeoJSON.bind(digipinPlus);
module.exports.toPolygonGeoJSON = geojson.digipinsToPolygonCollection;
module.exports.fromGeoJSON = geojson.pointsToDigipins;

// Analysis functions
module.exports.analyzeDensity = density.calculateDensity;
module.exports.findHotspots = density.findHotspots;
module.exports.findColdSpots = density.findColdSpots;

// Fluent API methods
module.exports.from = digipinPlus.from.bind(digipinPlus);

// Module exports for advanced usage
module.exports.core = {
  encoder,
  decoder,
  validator
};
module.exports.utils = {
  distance,
  geometry,
  neighbors,
  grid,
  clustering
};
module.exports.integrations = {
  geojson
};
module.exports.analysis = {
  density
};

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports.digipinPlus = digipinPlus;
}

// ES6 modules compatibility
if (typeof window !== 'undefined') {
  window.DigipinPlus = DigipinPlus;
  window.digipinPlus = digipinPlus;
}
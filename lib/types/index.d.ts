/**
 * TypeScript Definitions for digipin-plus
 * Comprehensive type definitions for all library functionality
 */

// Core types
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface DecodedDigipin {
  latitude: number;
  longitude: number;
  precision: number;
  bounds: Bounds;
  accuracy: {
    latDegrees: number;
    lonDegrees: number;
    approximateMeters: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  info?: {
    originalFormat: string;
    cleanFormat: string;
    precision: number;
    hasHyphens: boolean;
    estimatedAccuracy: AccuracyInfo;
  };
}

export interface AccuracyInfo {
  meters: number;
  description: string;
}

// Core functions
export declare namespace Core {
  namespace Encoder {
    function encode(lat: number, lon: number, precision?: number): string;
    function encodeBatch(coordinates: Array<{lat: number, lon: number, precision?: number}>): string[];
    function encodeWithBounds(lat: number, lon: number, precision?: number): {
      digipin: string;
      bounds: Bounds;
      center: Coordinates;
      area: number;
    };
  }

  namespace Decoder {
    function decode(digiPin: string): DecodedDigipin;
    function decodeBatch(digipins: string[]): DecodedDigipin[];
    function decodeSimple(digiPin: string): { latitude: string; longitude: string };
    function getSubDivisions(digiPin: string, targetPrecision?: number): DecodedDigipin[];
  }

  namespace Validator {
    function validate(digiPin: string, options?: {
      requireFullPrecision?: boolean;
      allowPartial?: boolean;
      requireHyphens?: boolean;
    }): ValidationResult;
    function validateCoordinates(lat: number, lon: number): ValidationResult;
    function isValid(digiPin: string): boolean;
    function getEstimatedAccuracy(precision: number): AccuracyInfo;
  }
}

// Distance utilities
export declare namespace Distance {
  function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number;
  function digipinDistance(digipin1: string, digipin2: string): number;
  function bearing(lat1: number, lon1: number, lat2: number, lon2: number): number;
  function digipinBearing(digipin1: string, digipin2: string): number;
  function midpoint(lat1: number, lon1: number, lat2: number, lon2: number): Coordinates;
  function digipinMidpoint(digipin1: string, digipin2: string): Coordinates;
  function isWithinRadius(lat1: number, lon1: number, lat2: number, lon2: number, radius: number): boolean;
  function digipinWithinRadius(digipin: string, lat: number, lon: number, radius: number): boolean;
  function getClosest(digipins: string[], lat: number, lon: number, count?: number): Array<{
    digipin: string;
    distance: number;
    coordinates: DecodedDigipin;
  }>;
}

// Geometry utilities
export declare namespace Geometry {
  function digipinArea(digipin: string): number;
  function digipinPerimeter(digipin: string): number;
  function getBoundingBox(digipins: string[]): Bounds & { center: Coordinates };
  function isPointInDigipin(lat: number, lon: number, digipin: string): boolean;
  function digipinsIntersect(digipin1: string, digipin2: string): boolean;
  function digipinIntersectionArea(digipin1: string, digipin2: string): number;
  function digipinPolygon(digipin: string): number[][];
  function digipinContains(outerDigipin: string, innerDigipin: string): boolean;
  function digipinConvexHull(digipins: string[]): Coordinates[];
}

// Neighbor utilities
export declare namespace Neighbors {
  function getNeighbors(digipin: string): string[];
  function getNeighborsInRadius(digipin: string, radius?: number): string[];
  function getChildren(digipin: string): string[];
  function getParent(digipin: string): string;
  function getSiblings(digipin: string): string[];
  function findNearest(lat: number, lon: number, precision?: number): string;
  function getGrid(centerDigipin: string, gridSize?: number): (string | null)[][];
  function areNeighbors(digipin1: string, digipin2: string): boolean;
  function getBorderDigipins(digipins: string[]): string[];
}

// Grid utilities
export declare namespace Grid {
  function generateGrid(bounds: Bounds, precision?: number): string[];
  function generateLineGrid(lat1: number, lon1: number, lat2: number, lon2: number, precision?: number, steps?: number): string[];
  function generateCircularGrid(centerLat: number, centerLon: number, radiusKm: number, precision?: number): string[];
  function generatePolygonGrid(vertices: Array<{lat: number, lon: number}>, precision?: number): string[];
  function generateSparseGrid(bounds: Bounds, precision?: number, density?: number): string[];
  function generateSystematicGrid(bounds: Bounds, precision?: number, spacing?: number): string[];
  function generateHierarchicalGrid(bounds: Bounds, precisionLevels?: number[]): Record<number, string[]>;
}

// Clustering utilities
export interface ClusteringResult {
  clusters: Record<number, string[]>;
  centroids?: Coordinates[];
  iterations?: number;
  converged?: boolean;
}

export interface DBSCANResult {
  clusters: Record<number, string[]>;
  noise: string[];
  totalClusters: number;
}

export interface HierarchicalResult {
  clusters: Record<number, string[]>;
  dendrogram: Array<{
    cluster1: number;
    cluster2: number;
    distance: number;
    newCluster: number;
  }>;
  threshold: number;
}

export declare namespace Clustering {
  function kMeansClustering(digipins: string[], k?: number, maxIterations?: number): ClusteringResult;
  function dbscanClustering(digipins: string[], epsilon?: number, minPoints?: number): DBSCANResult;
  function hierarchicalClustering(digipins: string[], threshold?: number): HierarchicalResult;
  function gridBasedClustering(digipins: string[], precision?: number): {
    clusters: Record<string, string[]>;
    clusterCount: number;
    precision: number;
  };
}

// GeoJSON integration
export interface GeoJSONFeature {
  type: 'Feature';
  geometry: any;
  properties: Record<string, any>;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export declare namespace GeoJSON {
  function digipinToPoint(digipin: string, properties?: Record<string, any>): GeoJSONFeature;
  function digipinToPolygon(digipin: string, properties?: Record<string, any>): GeoJSONFeature;
  function digipinsToPointCollection(digipins: string[], commonProperties?: Record<string, any>): GeoJSONFeatureCollection;
  function digipinsToPolygonCollection(digipins: string[], commonProperties?: Record<string, any>): GeoJSONFeatureCollection;
  function clustersToGeoJSON(clusters: Record<number, string[]>, geometryType?: 'Point' | 'Polygon'): GeoJSONFeatureCollection;
  function pointsToDigipins(geojson: GeoJSONFeature | GeoJSONFeatureCollection, precision?: number): Array<{
    digipin: string;
    originalProperties: Record<string, any>;
    coordinates: Coordinates;
  }>;
  function digipinsToLineString(digipins: string[], properties?: Record<string, any>): GeoJSONFeature;
  function clustersToMultiPolygon(clusters: Record<number, string[]>): GeoJSONFeatureCollection;
  function createDensityGeoJSON(digipins: string[], gridPrecision?: number): GeoJSONFeatureCollection;
  function validateGeoJSON(geojson: any): ValidationResult;
}

// Analysis utilities
export interface DensityStats {
  total: {
    digipins: number;
    cells: number;
    occupiedCells: number;
    coverage: number;
  };
  density: {
    mean: number;
    median: number;
    mode: number;
    max: number;
    min: number;
    standardDeviation: number;
    variance: number;
    perSquareDegree: number;
  };
  area: {
    totalSquareDegrees: number;
    averageCellArea: number;
    bounds: Bounds;
  };
  distribution: Record<string, number>;
}

export interface Hotspot {
  gridKey: string;
  density: number;
  center: Coordinates;
  bounds: Bounds;
  significance: number;
}

export declare namespace Analysis {
  function calculateDensity(digipins: string[], bounds: Bounds, gridPrecision?: number): DensityStats;
  function findHotspots(digipins: string[], threshold?: number, gridPrecision?: number): Hotspot[];
  function findColdSpots(digipins: string[], threshold?: number, gridPrecision?: number): Hotspot[];
  function calculateSpatialAutocorrelation(digipins: string[], gridPrecision?: number): {
    moransI: number;
    interpretation: string;
    significanceLevel: string;
    cellCount: number;
    totalWeights: number;
  };
  function calculateNearestNeighborStats(digipins: string[], sampleSize?: number): {
    meanNearestNeighborDistance: number;
    medianNearestNeighborDistance: number;
    maxNearestNeighborDistance: number;
    minNearestNeighborDistance: number;
    sampleSize: number;
    distributionType: string;
  };
}

// Main class
export declare class DigipinPlus {
  // Core functionality
  encode(lat: number, lon: number, precision?: number): string;
  decode(digiPin: string): DecodedDigipin;
  validate(digiPin: string): ValidationResult;

  // Batch operations
  encodeBatch(coordinates: Array<{lat: number, lon: number, precision?: number}>): string[];
  decodeBatch(digipins: string[]): DecodedDigipin[];

  // Distance calculations
  distance(digipin1: string, digipin2: string): number;
  bearing(digipin1: string, digipin2: string): number;
  midpoint(digipin1: string, digipin2: string): Coordinates;

  // Geometric operations
  area(digipin: string): number;
  perimeter(digipin: string): number;
  polygon(digipin: string): number[][];

  // Neighbor operations
  neighbors(digipin: string): string[];
  children(digipin: string): string[];
  parent(digipin: string): string;

  // Grid operations
  generateGrid(bounds: Bounds, precision?: number): string[];
  generateCircularGrid(centerLat: number, centerLon: number, radiusKm: number, precision?: number): string[];

  // Clustering
  cluster(digipins: string[], method?: 'kmeans' | 'dbscan' | 'hierarchical', options?: any): any;

  // GeoJSON conversion
  toGeoJSON(digipins: string[], type?: 'point' | 'polygon'): GeoJSONFeatureCollection;
  fromGeoJSON(geojson: GeoJSONFeature | GeoJSONFeatureCollection, precision?: number): string[];

  // Analysis
  analyzeDensity(digipins: string[], bounds: Bounds): DensityStats;
  findHotspots(digipins: string[]): Hotspot[];
}

// Default export
declare const digipinPlus: DigipinPlus;
export default digipinPlus;

// Named exports for tree-shaking
export const encode: typeof Core.Encoder.encode;
export const decode: typeof Core.Decoder.decode;
export const validate: typeof Core.Validator.validate;
export const distance: typeof Distance.digipinDistance;
export const neighbors: typeof Neighbors.getNeighbors;
export const cluster: typeof Clustering.kMeansClustering;
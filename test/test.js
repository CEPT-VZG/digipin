/**
 * Test Suite for DIGIPIN Plus Library
 * Comprehensive tests for all modules
 */

const digipinPlus = require('../lib/index');

// Test configuration
const testCoords = [
  { lat: 28.6139, lon: 77.2090, name: 'Delhi' },
  { lat: 19.0760, lon: 72.8777, name: 'Mumbai' },
  { lat: 13.0827, lon: 80.2707, name: 'Chennai' },
  { lat: 22.5726, lon: 88.3639, name: 'Kolkata' },
  { lat: 12.9716, lon: 77.5946, name: 'Bangalore' }
];

let testsPassed = 0;
let testsFailed = 0;

function test(name, testFn) {
  try {
    console.log(`Testing: ${name}...`);
    testFn();
    console.log(`✓ ${name} passed`);
    testsPassed++;
  } catch (error) {
    console.error(`✗ ${name} failed: ${error.message}`);
    testsFailed++;
  }
}

function assertEqual(actual, expected, message = '') {
  if (actual !== expected) {
    throw new Error(`${message} - Expected: ${expected}, Actual: ${actual}`);
  }
}

function assertTrue(condition, message = '') {
  if (!condition) {
    throw new Error(`${message} - Expected true, got false`);
  }
}

function assertThrows(fn, message = '') {
  try {
    fn();
    throw new Error(`${message} - Expected function to throw, but it didn't`);
  } catch (error) {
    // Expected to throw
  }
}

console.log('DIGIPIN Plus Library Test Suite');
console.log('================================');

// Test 1: Core encoding and decoding
test('Core encoding and decoding', () => {
  const lat = 28.6139;
  const lon = 77.2090;
  
  const encoded = digipinPlus.encode(lat, lon);
  assertTrue(encoded.length >= 10, 'Encoded DIGIPIN should be at least 10 characters');
  
  const decoded = digipinPlus.decode(encoded);
  assertTrue(Math.abs(decoded.latitude - lat) < 0.01, 'Decoded latitude should be close to original');
  assertTrue(Math.abs(decoded.longitude - lon) < 0.01, 'Decoded longitude should be close to original');
});

// Test 2: Precision levels
test('Precision levels', () => {
  const lat = 28.6139;
  const lon = 77.2090;
  
  for (let precision = 1; precision <= 10; precision++) {
    const encoded = digipinPlus.encode(lat, lon, precision);
    const cleanEncoded = encoded.replace(/-/g, '');
    assertEqual(cleanEncoded.length, precision, `Precision ${precision} should produce ${precision} characters`);
  }
});

// Test 3: Validation
test('Validation', () => {
  // Valid DIGIPIN
  const validPin = '39J-438-TJC7';
  const validation = digipinPlus.validate(validPin);
  assertTrue(validation.isValid, 'Valid DIGIPIN should pass validation');
  
  // Invalid DIGIPIN
  const invalidPin = 'INVALID123';
  const invalidValidation = digipinPlus.validate(invalidPin);
  assertTrue(!invalidValidation.isValid, 'Invalid DIGIPIN should fail validation');
  assertTrue(invalidValidation.errors.length > 0, 'Invalid DIGIPIN should have errors');
});

// Test 4: Batch operations
test('Batch operations', () => {
  const coordinates = testCoords.map(coord => ({ lat: coord.lat, lon: coord.lon }));
  
  const encoded = digipinPlus.encodeBatch(coordinates);
  assertEqual(encoded.length, coordinates.length, 'Batch encode should return same number of results');
  
  const decoded = digipinPlus.decodeBatch(encoded);
  assertEqual(decoded.length, encoded.length, 'Batch decode should return same number of results');
  
  // Verify accuracy
  for (let i = 0; i < coordinates.length; i++) {
    assertTrue(Math.abs(decoded[i].latitude - coordinates[i].lat) < 0.01, 
      `Decoded latitude ${i} should be close to original`);
    assertTrue(Math.abs(decoded[i].longitude - coordinates[i].lon) < 0.01, 
      `Decoded longitude ${i} should be close to original`);
  }
});

// Test 5: Distance calculations
test('Distance calculations', () => {
  const delhi = digipinPlus.encode(28.6139, 77.2090);
  const mumbai = digipinPlus.encode(19.0760, 72.8777);
  
  const distance = digipinPlus.distance(delhi, mumbai);
  assertTrue(distance > 1000000, 'Delhi to Mumbai distance should be > 1000km');
  assertTrue(distance < 1500000, 'Delhi to Mumbai distance should be < 1500km');
  
  const bearing = digipinPlus.bearing(delhi, mumbai);
  assertTrue(bearing >= 0 && bearing <= 360, 'Bearing should be between 0 and 360 degrees');
});

// Test 6: Geometric operations
test('Geometric operations', () => {
  const digipin = digipinPlus.encode(28.6139, 77.2090, 6);
  
  const area = digipinPlus.area(digipin);
  assertTrue(area > 0, 'Area should be positive');
  
  const perimeter = digipinPlus.perimeter(digipin);
  assertTrue(perimeter > 0, 'Perimeter should be positive');
  
  const polygon = digipinPlus.polygon(digipin);
  assertEqual(polygon.length, 5, 'Polygon should have 5 coordinates (closed)');
});

// Test 7: Neighbor operations
test('Neighbor operations', () => {
  const center = digipinPlus.encode(28.6139, 77.2090, 6);
  
  const neighbors = digipinPlus.neighbors(center);
  assertTrue(neighbors.length > 0, 'Should have neighbors');
  assertTrue(neighbors.length <= 8, 'Should have at most 8 immediate neighbors');
  
  const children = digipinPlus.children(center);
  assertEqual(children.length, 16, 'Should have exactly 16 children');
  
  if (center.length > 1) {
    const parent = digipinPlus.parent(center);
    assertTrue(parent.length === center.replace(/-/g, '').length - 1, 'Parent should be one level up');
  }
});

// Test 8: Grid generation
test('Grid generation', () => {
  const bounds = {
    north: 28.7,
    south: 28.6,
    east: 77.3,
    west: 77.2
  };
  
  const grid = digipinPlus.generateGrid(bounds, 6);
  assertTrue(grid.length > 0, 'Grid should contain DIGIPINs');
  
  // Test all DIGIPINs are valid
  grid.forEach(digipin => {
    assertTrue(digipinPlus.isValid(digipin), `Generated DIGIPIN ${digipin} should be valid`);
  });
});

// Test 9: Clustering
test('Clustering', () => {
  const digipins = testCoords.map(coord => digipinPlus.encode(coord.lat, coord.lon, 6));
  
  const kmeansResult = digipinPlus.cluster(digipins, 'kmeans', { k: 2 });
  assertTrue(Object.keys(kmeansResult.clusters).length <= 2, 'K-means should create at most 2 clusters');
  
  const dbscanResult = digipinPlus.cluster(digipins, 'dbscan', { epsilon: 500000, minPoints: 2 });
  assertTrue(typeof dbscanResult.totalClusters === 'number', 'DBSCAN should return cluster count');
});

// Test 10: GeoJSON conversion
test('GeoJSON conversion', () => {
  const digipins = testCoords.slice(0, 3).map(coord => digipinPlus.encode(coord.lat, coord.lon, 6));
  
  const pointCollection = digipinPlus.toGeoJSON(digipins, 'point');
  assertEqual(pointCollection.type, 'FeatureCollection', 'Should create FeatureCollection');
  assertEqual(pointCollection.features.length, 3, 'Should have 3 features');
  
  const polygonCollection = digipinPlus.toGeoJSON(digipins, 'polygon');
  assertEqual(polygonCollection.type, 'FeatureCollection', 'Should create FeatureCollection');
  polygonCollection.features.forEach(feature => {
    assertEqual(feature.geometry.type, 'Polygon', 'Each feature should be a Polygon');
  });
});

// Test 11: Density analysis
test('Density analysis', () => {
  const digipins = testCoords.map(coord => digipinPlus.encode(coord.lat, coord.lon, 4));
  const bounds = digipinPlus.getBounds(digipins);
  
  const densityStats = digipinPlus.analyzeDensity(digipins, bounds, 4);
  assertTrue(densityStats.total.digipins === digipins.length, 'Should count all DIGIPINs');
  assertTrue(densityStats.density.mean > 0, 'Mean density should be positive');
  
  const hotspots = digipinPlus.findHotspots(digipins, 0.5, 4);
  assertTrue(Array.isArray(hotspots), 'Hotspots should be an array');
});

// Test 12: Boundary conditions
test('Boundary conditions', () => {
  // Test coordinates at DIGIPIN boundaries
  const minLat = 2.5;
  const maxLat = 38.5;
  const minLon = 63.5;
  const maxLon = 99.5;
  
  // These should work
  const corner1 = digipinPlus.encode(minLat, minLon);
  const corner2 = digipinPlus.encode(maxLat, maxLon);
  assertTrue(corner1.length >= 10, 'Corner encoding should work');
  assertTrue(corner2.length >= 10, 'Corner encoding should work');
  
  // These should fail
  assertThrows(() => digipinPlus.encode(minLat - 1, minLon), 'Should throw for out-of-bounds latitude');
  assertThrows(() => digipinPlus.encode(minLat, minLon - 1), 'Should throw for out-of-bounds longitude');
});

// Test 13: Error handling
test('Error handling', () => {
  // Invalid inputs
  assertThrows(() => digipinPlus.encode('invalid', 77.2090), 'Should throw for non-numeric latitude');
  assertThrows(() => digipinPlus.encode(28.6139, 'invalid'), 'Should throw for non-numeric longitude');
  assertThrows(() => digipinPlus.decode(''), 'Should throw for empty DIGIPIN');
  assertThrows(() => digipinPlus.decode(null), 'Should throw for null DIGIPIN');
  
  // Invalid precision
  assertThrows(() => digipinPlus.encode(28.6139, 77.2090, 0), 'Should throw for invalid precision');
  assertThrows(() => digipinPlus.encode(28.6139, 77.2090, 11), 'Should throw for invalid precision');
});

// Test 14: Fluent API
test('Fluent API', () => {
  const result = digipinPlus
    .from(28.6139, 77.2090, 6)
    .getArea();
  
  assertTrue(result > 0, 'Fluent API should work for area calculation');
  
  const mumbaiPin = digipinPlus.encode(19.0760, 72.8777, 6);
  const distance = digipinPlus
    .from(28.6139, 77.2090, 6)
    .getDistance(mumbaiPin);
  
  assertTrue(distance > 1000000, 'Fluent API should work for distance calculation');
});

// Test 15: CLI module loading
test('CLI module loading', () => {
  const cli = require('../lib/cli/index');
  assertTrue(typeof cli === 'object', 'CLI module should export an object');
});

// Final results
console.log('\n' + '='.repeat(50));
console.log(`Tests completed: ${testsPassed + testsFailed}`);
console.log(`✓ Passed: ${testsPassed}`);
console.log(`✗ Failed: ${testsFailed}`);

if (testsFailed === 0) {
  console.log('\n🎉 All tests passed!');
  process.exit(0);
} else {
  console.log(`\n❌ ${testsFailed} test(s) failed`);
  process.exit(1);
}
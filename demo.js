/**
 * DIGIPIN Plus Demo Script
 * Showcases the comprehensive features of the library
 */

const digipinPlus = require('./lib/index');

console.log('🌏 DIGIPIN Plus - Comprehensive Demo');
console.log('====================================\n');

// Demo data: Major Indian cities
const cities = [
  { name: 'Delhi', lat: 28.6139, lon: 77.2090 },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
  { name: 'Bangalore', lat: 12.9716, lon: 77.5946 },
  { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
  { name: 'Pune', lat: 18.5204, lon: 73.8567 },
  { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714 }
];

console.log('📍 1. ENCODING MAJOR CITIES TO DIGIPINS');
console.log('-'.repeat(50));
const cityDigipins = cities.map(city => {
  const digipin = digipinPlus.encode(city.lat, city.lon);
  console.log(`${city.name.padEnd(12)}: ${digipin}`);
  return { ...city, digipin };
});

console.log('\n📐 2. DISTANCE ANALYSIS');
console.log('-'.repeat(50));
const delhi = cityDigipins[0];
const mumbai = cityDigipins[1];
const distance = digipinPlus.distance(delhi.digipin, mumbai.digipin);
const bearing = digipinPlus.bearing(delhi.digipin, mumbai.digipin);
const midpoint = digipinPlus.midpoint(delhi.digipin, mumbai.digipin);

console.log(`Distance from ${delhi.name} to ${mumbai.name}: ${Math.round(distance/1000)} km`);
console.log(`Bearing: ${Math.round(bearing)}°`);
console.log(`Midpoint: ${midpoint.latitude.toFixed(4)}, ${midpoint.longitude.toFixed(4)}`);

console.log('\n🎯 3. PRECISION LEVELS DEMO');
console.log('-'.repeat(50));
for (let precision = 1; precision <= 10; precision++) {
  const pin = digipinPlus.encode(delhi.lat, delhi.lon, precision);
  const accuracy = digipinPlus.core.validator.getEstimatedAccuracy(precision);
  console.log(`Level ${precision.toString().padStart(2)}: ${pin.padEnd(12)} (~${accuracy.description})`);
}

console.log('\n🏘️  4. NEIGHBOR ANALYSIS');
console.log('-'.repeat(50));
const centerPin = digipinPlus.encode(delhi.lat, delhi.lon, 6);
console.log(`Center DIGIPIN: ${centerPin}`);

const neighbors = digipinPlus.neighbors(centerPin);
console.log(`Immediate neighbors: ${neighbors.length}`);
neighbors.slice(0, 4).forEach((neighbor, i) => {
  console.log(`  ${i+1}. ${neighbor}`);
});

const children = digipinPlus.children(centerPin);
console.log(`Children (next level): ${children.length}`);
console.log(`  First few: ${children.slice(0, 3).join(', ')}...`);

console.log('\n🗺️  5. GRID GENERATION');
console.log('-'.repeat(50));
const bounds = {
  north: 28.7,
  south: 28.6,
  east: 77.3,
  west: 77.2
};

const grid = digipinPlus.generateGrid(bounds, 6);
console.log(`Generated grid for Delhi region: ${grid.length} DIGIPINs`);
console.log(`Sample DIGIPINs: ${grid.slice(0, 5).join(', ')}...`);

const circularGrid = digipinPlus.generateCircularGrid(delhi.lat, delhi.lon, 10, 6);
console.log(`Circular grid (10km radius): ${circularGrid.length} DIGIPINs`);

console.log('\n🔍 6. CLUSTERING ANALYSIS');
console.log('-'.repeat(50));
const digipins = cityDigipins.map(city => city.digipin);

// K-means clustering
const kmeansResult = digipinPlus.cluster(digipins, 'kmeans', { k: 3 });
console.log(`K-means clustering (k=3): ${Object.keys(kmeansResult.clusters).length} clusters`);
Object.entries(kmeansResult.clusters).forEach(([cluster, pins], i) => {
  console.log(`  Cluster ${i+1}: ${pins.length} cities`);
});

// Grid-based clustering
const gridClusters = digipinPlus.cluster(digipins, 'grid', { precision: 4 });
console.log(`Grid-based clustering: ${gridClusters.clusterCount} regions`);

console.log('\n📊 7. DENSITY ANALYSIS');
console.log('-'.repeat(50));
const allBounds = digipinPlus.getBounds(digipins);
console.log(`Analysis bounds: ${allBounds.south.toFixed(1)}°-${allBounds.north.toFixed(1)}°N, ${allBounds.west.toFixed(1)}°-${allBounds.east.toFixed(1)}°E`);

const densityStats = digipinPlus.analyzeDensity(digipins, allBounds, 4);
console.log(`Total DIGIPINs: ${densityStats.total.digipins}`);
console.log(`Coverage: ${densityStats.total.coverage.toFixed(1)}%`);
console.log(`Mean density: ${densityStats.density.mean.toFixed(2)} DIGIPINs per cell`);

const hotspots = digipinPlus.findHotspots(digipins, 1.0, 4);
console.log(`Hotspots found: ${hotspots.length}`);

console.log('\n📄 8. GEOJSON CONVERSION');
console.log('-'.repeat(50));
const pointGeoJSON = digipinPlus.toGeoJSON(digipins.slice(0, 3), 'point');
console.log(`Point GeoJSON: ${pointGeoJSON.features.length} features`);

const polygonGeoJSON = digipinPlus.toGeoJSON(digipins.slice(0, 3), 'polygon');
console.log(`Polygon GeoJSON: ${polygonGeoJSON.features.length} features`);

const clusterGeoJSON = digipinPlus.integrations.geojson.clustersToGeoJSON(kmeansResult.clusters, 'Point');
console.log(`Cluster GeoJSON: ${clusterGeoJSON.features.length} features with cluster info`);

console.log('\n✅ 9. VALIDATION DEMO');
console.log('-'.repeat(50));
const testCases = [
  '39J-438-TJC7',  // Valid full DIGIPIN
  '39J438',        // Valid partial DIGIPIN
  'INVALID',       // Invalid characters
  '39J-438-TJC7X', // Too long
  ''               // Empty
];

testCases.forEach(testCase => {
  const validation = digipinPlus.validate(testCase);
  const status = validation.isValid ? '✅' : '❌';
  console.log(`${status} "${testCase}" - ${validation.isValid ? 'Valid' : validation.errors[0]}`);
});

console.log('\n🎭 10. FLUENT API DEMO');
console.log('-'.repeat(50));
const fluentResult = digipinPlus
  .from(28.6139, 77.2090, 6)
  .getArea();
console.log(`Area using fluent API: ${Math.round(fluentResult)} square meters`);

const fluentDistance = digipinPlus
  .from(28.6139, 77.2090, 6)
  .getDistance(mumbai.digipin);
console.log(`Distance using fluent API: ${Math.round(fluentDistance/1000)} km`);

console.log('\n🎉 DEMO COMPLETED!');
console.log('================');
console.log('🚀 DIGIPIN Plus offers comprehensive geospatial capabilities');
console.log('📚 Check out the full documentation in README.md');
console.log('⭐ Ready for production use in your applications!');
console.log('\n💡 Try the CLI: node lib/cli/index.js --help');
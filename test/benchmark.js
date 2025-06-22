/**
 * Performance Benchmark for DIGIPIN Plus Library
 */

const digipinPlus = require('../lib/index');

function benchmark(name, fn, iterations = 1000) {
  console.log(`\n📊 Benchmarking: ${name}`);
  
  const start = process.hrtime.bigint();
  
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  
  const end = process.hrtime.bigint();
  const totalMs = Number(end - start) / 1000000;
  const avgMs = totalMs / iterations;
  
  console.log(`   Total time: ${totalMs.toFixed(2)}ms`);
  console.log(`   Average: ${avgMs.toFixed(4)}ms per operation`);
  console.log(`   Throughput: ${Math.round(iterations / (totalMs / 1000))} ops/sec`);
}

console.log('🚀 DIGIPIN Plus Performance Benchmarks');
console.log('=====================================');

// Test coordinates
const testCoords = [
  { lat: 28.6139, lon: 77.2090 },
  { lat: 19.0760, lon: 72.8777 },
  { lat: 13.0827, lon: 80.2707 },
  { lat: 22.5726, lon: 88.3639 },
  { lat: 12.9716, lon: 77.5946 }
];

// Benchmark 1: Single encoding
benchmark('Single Encode', () => {
  digipinPlus.encode(28.6139, 77.2090);
}, 10000);

// Benchmark 2: Single decoding
const testPin = digipinPlus.encode(28.6139, 77.2090);
benchmark('Single Decode', () => {
  digipinPlus.decode(testPin);
}, 10000);

// Benchmark 3: Batch encoding
benchmark('Batch Encode (5 coords)', () => {
  digipinPlus.encodeBatch(testCoords);
}, 1000);

// Benchmark 4: Distance calculation
const pin1 = digipinPlus.encode(28.6139, 77.2090);
const pin2 = digipinPlus.encode(19.0760, 72.8777);
benchmark('Distance Calculation', () => {
  digipinPlus.distance(pin1, pin2);
}, 5000);

// Benchmark 5: Neighbor finding
benchmark('Neighbor Finding', () => {
  digipinPlus.neighbors(pin1);
}, 1000);

// Benchmark 6: Grid generation
const bounds = { north: 28.7, south: 28.6, east: 77.3, west: 77.2 };
benchmark('Grid Generation', () => {
  digipinPlus.generateGrid(bounds, 6);
}, 100);

// Benchmark 7: Validation
benchmark('Validation', () => {
  digipinPlus.validate(pin1);
}, 5000);

// Memory usage
const memUsage = process.memoryUsage();
console.log(`\n💾 Memory Usage:`);
console.log(`   RSS: ${Math.round(memUsage.rss / 1024 / 1024)}MB`);
console.log(`   Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
console.log(`   Heap Total: ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`);

console.log('\n✅ Benchmark completed!');
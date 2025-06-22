/**
 * Basic Usage Examples for DIGIPIN Library
 */

import { 
  encode, 
  decode, 
  calculateDigipinDistance,
  getNeighbors,
  batchEncodeSync,
  validateDigipinFormat
} from '../index';

// Example 1: Basic encoding and decoding
console.log('=== Basic Encoding/Decoding ===');
const bangalore = { latitude: 12.9716, longitude: 77.5946 };
const digipin = encode(bangalore.latitude, bangalore.longitude);
console.log(`Bangalore coordinates: ${bangalore.latitude}, ${bangalore.longitude}`);
console.log(`Encoded DIGIPIN: ${digipin}`);

const decoded = decode(digipin);
console.log(`Decoded coordinates: ${decoded.latitude}, ${decoded.longitude}`);

// Example 2: Distance calculation
console.log('\n=== Distance Calculation ===');
const delhiDigipin = '39J-438-TJC7';
const bangaloreDigipin = '4P3-JK8-52C9';

const distance = calculateDigipinDistance(bangaloreDigipin, delhiDigipin);
console.log(`Distance between Bangalore and Delhi:`);
console.log(`  ${distance.kilometers} km`);
console.log(`  ${distance.miles} miles`);

// Example 3: Finding neighbors
console.log('\n=== Finding Neighbors ===');
const neighbors = getNeighbors(bangaloreDigipin);
console.log(`Neighbors of ${bangaloreDigipin}:`);
neighbors.slice(0, 5).forEach((neighbor: any) => {
  console.log(`  ${neighbor.digipin} (${neighbor.center.latitude}, ${neighbor.center.longitude})`);
});
console.log(`... and ${neighbors.length - 5} more neighbors`);

// Example 4: Batch processing
console.log('\n=== Batch Processing ===');
const cities = [
  { latitude: 12.9716, longitude: 77.5946 }, // Bangalore
  { latitude: 28.6139, longitude: 77.2090 }, // Delhi
  { latitude: 19.0760, longitude: 72.8777 }, // Mumbai
  { latitude: 13.0827, longitude: 80.2707 }, // Chennai
  { latitude: 22.5726, longitude: 88.3639 }  // Kolkata
];

const batchResult = batchEncodeSync(cities);
console.log(`Encoded ${batchResult.stats.successful} cities in ${batchResult.stats.duration}ms:`);
batchResult.results.forEach((digipin: string, index: number) => {
  console.log(`  City ${index + 1}: ${digipin}`);
});

// Example 5: Validation
console.log('\n=== Validation ===');
const testDigipins = ['4P3-JK8-52C9', 'INVALID-PIN', '39J-438-TJC7'];
testDigipins.forEach(pin => {
  const validation = validateDigipinFormat(pin);
  console.log(`${pin}: ${validation.valid ? '✓ Valid' : '✗ Invalid'}`);
  if (!validation.valid) {
    console.log(`  Error: ${validation.error}`);
  }
});

console.log('\n=== Example Complete ===');
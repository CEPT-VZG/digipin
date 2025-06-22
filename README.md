# @cept-vzg/digipin - Comprehensive DIGIPIN Library

<div align="center" style="display: flex; justify-content: center; align-items: center; gap: 20px;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Ministry_of_Communications_India.svg/1920px-Ministry_of_Communications_India.svg.png" alt="Ministry of Communications" width="240"/>
  <img src="https://dev.cept.gov.in/mydigipin/_next/image?url=%2Fmydigipin%2Fimages%2Findiapost_logo_v2.webp&w=1920&q=75" alt="India Post" width="120"/>
</div>

[![npm version](https://badge.fury.io/js/@cept-vzg%2Fdigipin.svg)](https://badge.fury.io/js/@cept-vzg%2Fdigipin)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v14+-green.svg)](https://nodejs.org/)

A comprehensive, feature-rich NPM library for working with **DIGIPINs** (Digital Postal Index Numbers) - the innovative geocoding system developed by the Department of Posts, Government of India.

## 🚀 Features

### Core DIGIPIN Operations
- ✅ **Encode/Decode** - Convert coordinates to DIGIPINs and vice versa
- ✅ **Batch Processing** - Handle multiple coordinates efficiently
- ✅ **Distance Calculations** - Calculate distances between DIGIPINs
- ✅ **Neighbor Discovery** - Find adjacent and nearby DIGIPINs
- ✅ **Grid Boundary Calculations** - Get precise bounds for any DIGIPIN

### Developer Experience
- ✅ **Full TypeScript Support** - Complete type definitions included
- ✅ **Modern ES6+ Syntax** - With backward compatibility
- ✅ **Comprehensive JSDoc** - Detailed documentation for all functions
- ✅ **Zero Dependencies** - No external dependencies for core functionality
- ✅ **Tree-Shakable** - Import only what you need

### Advanced Utilities
- ✅ **Pattern Validation** - Robust DIGIPIN format validation
- ✅ **Geographic Utilities** - Bearing, midpoint, and distance calculations
- ✅ **Performance Optimized** - Efficient algorithms for bulk operations
- ✅ **Error Handling** - Custom error types with detailed information
- ✅ **CLI Tool** - Command-line interface for developers

### Platform Support
- ✅ **Node.js & Browser** - Universal compatibility
- ✅ **CommonJS & ES Modules** - Multiple module formats
- ✅ **Integration Helpers** - For popular mapping libraries

## 📦 Installation

```bash
npm install @cept-vzg/digipin
```

## 🏃 Quick Start

### Basic Usage

```typescript
import { encode, decode, calculateDigipinDistance } from '@cept-vzg/digipin';

// Encode coordinates to DIGIPIN
const bangalore = { latitude: 12.9716, longitude: 77.5946 };
const digipin = encode(bangalore.latitude, bangalore.longitude);
console.log(digipin); // "4P3-JK8-52C9"

// Decode DIGIPIN back to coordinates
const coords = decode(digipin);
console.log(coords); // { latitude: 12.971601, longitude: 77.594584 }

// Calculate distance between two DIGIPINs
const delhi = "39J-438-TJC7";
const distance = calculateDigipinDistance(digipin, delhi);
console.log(`${distance.kilometers} km`); // ~1740 km
```

### Advanced Features

```typescript
import { 
  getNeighbors, 
  batchEncode, 
  validateDigipinFormat,
  calculateBearing
} from '@cept-vzg/digipin';

// Find neighboring DIGIPINs
const neighbors = getNeighbors("4P3-JK8-52C9");
console.log(`Found ${neighbors.length} neighbors`);

// Batch process multiple coordinates
const cities = [
  { latitude: 12.9716, longitude: 77.5946 }, // Bangalore
  { latitude: 28.6139, longitude: 77.2090 }, // Delhi
  { latitude: 19.0760, longitude: 72.8777 }  // Mumbai
];

const results = await batchEncode(cities);
console.log(results.results); // Array of DIGIPINs

// Validate DIGIPIN format
const validation = validateDigipinFormat("4P3-JK8-52C9");
console.log(validation.valid); // true

// Calculate bearing between locations
const bearing = calculateBearing(
  { latitude: 12.9716, longitude: 77.5946 },
  { latitude: 28.6139, longitude: 77.2090 }
);
console.log(`Initial bearing: ${bearing.initial}°`);
```

## 🖥️ CLI Usage

The library includes a powerful command-line tool:

```bash
# Install globally for CLI access
npm install -g @cept-vzg/digipin

# Encode coordinates
digipin encode 12.9716 77.5946
# Output: 4P3-JK8-52C9

# Decode DIGIPIN
digipin decode 4P3-JK8-52C9
# Output: 12.971601, 77.594584

# Calculate distance
digipin distance 4P3-JK8-52C9 39J-438-TJC7
# Output: 1740.12 km

# Find neighbors
digipin neighbors 4P3-JK8-52C9
# Lists all neighboring DIGIPINs

# Validate DIGIPIN
digipin validate 4P3-JK8-52C9
# Output: ✓ Valid DIGIPIN

# See all available commands
digipin --help
```

## 🌐 Web API Server

The package includes an Express.js server for HTTP API access:

```bash
npm start
# Server starts on http://localhost:5000
```

### API Endpoints

```http
# Encode coordinates
GET /api/digipin/encode?latitude=12.9716&longitude=77.5946

# Decode DIGIPIN
GET /api/digipin/decode?digipin=4P3-JK8-52C9

# Calculate distance
GET /api/digipin/distance?from=4P3-JK8-52C9&to=39J-438-TJC7

# Find neighbors
GET /api/digipin/neighbors?digipin=4P3-JK8-52C9

# Batch operations
POST /api/digipin/batch/encode
Content-Type: application/json
{
  "coordinates": [
    {"latitude": 12.9716, "longitude": 77.5946},
    {"latitude": 28.6139, "longitude": 77.2090}
  ]
}
```

## 🏛️ About DIGIPIN

The Department of Posts has undertaken an initiative to establish a Digital Public Infrastructure (DPI) for a standardized, geo-coded addressing system in India. DIGIPIN represents the foundation layer of this infrastructure.

Developed in collaboration with IIT Hyderabad and NRSC (National Remote Sensing Centre, ISRO), DIGIPIN is an open-source national-level addressing grid that serves as a key component of India's digital address ecosystem.

### Key Advantages

- **Compact**: Only 10 characters encode precise locations
- **Human-Readable**: Uses memorable alphanumeric characters
- **Hierarchical**: Each level provides meaningful geographic grouping
- **Precise**: Final level accuracy of approximately 3.8m × 3.8m
- **Stable**: Doesn't change with infrastructure modifications

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/CEPT-VZG/digipin.git
cd digipin

# Install dependencies
npm install

# Build the project
npm run build

# Run development server
npm run dev

# Lint code
npm run lint
```

## 📊 Performance

The library is optimized for performance with:

- **Efficient algorithms**: O(1) encoding/decoding operations
- **Batch processing**: Concurrent processing with configurable limits
- **Memory efficient**: Minimal memory footprint
- **Tree-shakable**: Only bundle what you use

Benchmark results on standard hardware:
- Single encode/decode: ~0.01ms
- Batch 1000 operations: ~10ms
- Memory usage: <1MB for core functions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with tests
4. Ensure all tests pass (`npm test`)
5. Submit a pull request

Please ensure your code adheres to the existing style and passes all tests.

## 📜 License

This project is licensed under the Apache License, Version 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Department of Posts, Government of India** - Original DIGIPIN specification
- **IIT Hyderabad** - Algorithm development and research
- **NRSC-ISRO** - Geospatial expertise and validation
- **Open Source Community** - Contributions and feedback

---

**Transforming addresses for Digital India 🇮🇳**

*Made with ❤️ by the Department of Posts, Government of India*
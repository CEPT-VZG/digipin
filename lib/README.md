# DIGIPIN Plus 🌏

**The most comprehensive DIGIPIN library for JavaScript developers**

DIGIPIN Plus is an advanced, feature-rich library that extends the basic DIGIPIN encoding/decoding functionality with comprehensive geospatial utilities, clustering algorithms, density analysis, and integration tools for modern web and Node.js applications.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js](https://img.shields.io/badge/Node.js-v12+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Supported-blue.svg)](https://www.typescriptlang.org/)

## 🚀 Features

### Core DIGIPIN Operations
- **Enhanced encoding/decoding** with precision levels (1-10)
- **Batch operations** for processing multiple coordinates
- **Comprehensive validation** with detailed error messages
- **Distance calculations** between DIGIPINs
- **Neighboring DIGIPIN discovery** with customizable radius
- **Bounding box calculations** for DIGIPIN regions

### Geospatial Utilities
- **Grid generation** for geographic areas
- **Geofencing** with DIGIPIN grids
- **Bearing and midpoint calculations**
- **Area calculations** for DIGIPIN regions
- **Geometric operations** (intersection, containment, convex hull)

### Advanced Analytics
- **Clustering algorithms** (K-means, DBSCAN, Hierarchical, Grid-based)
- **Density analysis** with hotspot detection
- **Spatial autocorrelation** analysis
- **Statistical functions** for DIGIPIN distributions
- **Nearest neighbor analysis**

### Integration & Conversion
- **GeoJSON conversion** utilities
- **Database query helpers**
- **Popular mapping library support**
- **Streaming support** for large datasets
- **CLI tools** for quick operations

### Developer Experience
- **TypeScript definitions** included
- **Zero dependencies** for core functionality
- **Browser and Node.js** compatibility
- **Comprehensive documentation** with examples
- **Performance optimized** with memoization

## 📦 Installation

```bash
npm install digipin-plus
```

## 🔧 Quick Start

### Basic Usage

```javascript
const digipinPlus = require('digipin-plus');

// Encode coordinates to DIGIPIN
const digipin = digipinPlus.encode(28.6139, 77.2090);
console.log(digipin); // "39J-438-TJC7"

// Decode DIGIPIN to coordinates
const coords = digipinPlus.decode(digipin);
console.log(coords.latitude, coords.longitude); // 28.6139 77.2090

// Calculate distance between two DIGIPINs
const distance = digipinPlus.distance(digipin1, digipin2);
console.log(`Distance: ${distance} meters`);
```

### Fluent API

```javascript
const result = digipinPlus
  .from(28.6139, 77.2090, 6)
  .getArea();

const distance = digipinPlus
  .from(28.6139, 77.2090, 6)
  .getDistance('4FK-595-8823');
```

### Class-based Usage

```javascript
const { DigipinPlus } = require('digipin-plus');
const dp = new DigipinPlus();

const encoded = dp.encode(28.6139, 77.2090);
const decoded = dp.decode(encoded);
```

## 🌍 Advanced Examples

### Batch Operations

```javascript
const coordinates = [
  { lat: 28.6139, lon: 77.2090 }, // Delhi
  { lat: 19.0760, lon: 72.8777 }, // Mumbai
  { lat: 13.0827, lon: 80.2707 }  // Chennai
];

const digipins = digipinPlus.encodeBatch(coordinates);
const decoded = digipinPlus.decodeBatch(digipins);
```

### Grid Generation

```javascript
// Generate a grid for a bounding box
const bounds = {
  north: 28.7,
  south: 28.6,
  east: 77.3,
  west: 77.2
};

const grid = digipinPlus.generateGrid(bounds, 6);
console.log(`Generated ${grid.length} DIGIPINs`);

// Generate a circular grid
const circularGrid = digipinPlus.generateCircularGrid(
  28.6139, 77.2090, // Center coordinates
  10,               // Radius in km
  6                 // Precision level
);
```

### Clustering Analysis

```javascript
const digipins = [/* array of DIGIPIN codes */];

// K-means clustering
const kmeansResult = digipinPlus.cluster(digipins, 'kmeans', { k: 3 });

// DBSCAN clustering
const dbscanResult = digipinPlus.cluster(digipins, 'dbscan', {
  epsilon: 1000,    // 1km radius
  minPoints: 3
});

// Hierarchical clustering
const hierarchicalResult = digipinPlus.cluster(digipins, 'hierarchical', {
  threshold: 5000   // 5km threshold
});
```

### Density Analysis

```javascript
const bounds = digipinPlus.getBounds(digipins);
const densityStats = digipinPlus.analyzeDensity(digipins, bounds);

console.log(`Mean density: ${densityStats.density.mean}`);
console.log(`Coverage: ${densityStats.total.coverage}%`);

// Find hotspots
const hotspots = digipinPlus.findHotspots(digipins, 2.0); // 2 std dev above mean
console.log(`Found ${hotspots.length} hotspots`);
```

### GeoJSON Integration

```javascript
// Convert DIGIPINs to GeoJSON
const geojson = digipinPlus.toGeoJSON(digipins, 'point');

// Convert GeoJSON back to DIGIPINs
const convertedDigipins = digipinPlus.fromGeoJSON(geojson, 8);

// Create polygon representation
const polygonGeoJSON = digipinPlus.toGeoJSON(digipins, 'polygon');
```

### Neighbor Operations

```javascript
const center = 'F9J-438-TJC7';

// Get immediate neighbors (8-directional)
const neighbors = digipinPlus.neighbors(center);

// Get neighbors within radius
const nearbyDigipins = digipinPlus.neighbors(center, 2);

// Get children (next precision level)
const children = digipinPlus.children(center);

// Get parent (previous precision level)
const parent = digipinPlus.parent(center);
```

## 🖥️ CLI Usage

DIGIPIN Plus includes a powerful command-line interface:

```bash
# Encode coordinates
digipin-plus encode 28.6139 77.2090
# Output: 39J-438-TJC7

# Decode DIGIPIN
digipin-plus decode 39J-438-TJC7
# Output: Latitude: 28.6139, Longitude: 77.2090

# Calculate distance
digipin-plus distance 39J-438-TJC7 4FK-595-8823
# Output: 1148096.4 m

# Find neighbors
digipin-plus neighbors 39J-438-TJC7 --radius 2

# Generate grid
digipin-plus grid --north 28.7 --south 28.6 --east 77.3 --west 77.2

# Validate DIGIPIN
digipin-plus validate 39J-438-TJC7

# Batch encode from CSV
digipin-plus batch-encode coordinates.csv --output results.csv

# Show information
digipin-plus info
```

## 📊 Performance

DIGIPIN Plus is optimized for performance with:

- **Memoization** for frequently accessed calculations
- **Batch processing** optimization
- **Efficient algorithms** for clustering and analysis
- **Memory-efficient** data structures
- **Streaming support** for large datasets

### Benchmarks

```javascript
// Encode 10,000 coordinates
const start = Date.now();
const results = digipinPlus.encodeBatch(coordinates);
console.log(`Encoded 10,000 coordinates in ${Date.now() - start}ms`);

// Typical performance: ~50ms for 10,000 coordinates
```

## 🔌 Integration Examples

### Leaflet Integration

```javascript
// Add DIGIPIN grid overlay to Leaflet map
const gridLayer = L.geoJSON(digipinPlus.toGeoJSON(gridDigipins, 'polygon'), {
  style: { color: 'blue', weight: 1, opacity: 0.6 }
}).addTo(map);
```

### Database Integration

```javascript
// Find DIGIPINs within a region for database queries
const region = { north: 28.7, south: 28.6, east: 77.3, west: 77.2 };
const queryDigipins = digipinPlus.generateGrid(region, 6);

// Use for spatial database queries
const query = `SELECT * FROM locations WHERE digipin IN (${queryDigipins.map(d => `'${d}'`).join(',')})`;
```

## 📚 API Reference

### Core Functions

#### `encode(lat, lon, precision = 10)`
Encode coordinates to DIGIPIN.

#### `decode(digipin)`
Decode DIGIPIN to coordinates with metadata.

#### `validate(digipin, options = {})`
Validate DIGIPIN format with detailed results.

#### `distance(digipin1, digipin2)`
Calculate Haversine distance between DIGIPINs.

### Utility Functions

#### `neighbors(digipin, radius = 1)`
Get neighboring DIGIPINs.

#### `area(digipin)`
Calculate area of DIGIPIN region in square meters.

#### `generateGrid(bounds, precision = 6)`
Generate DIGIPIN grid for bounding box.

#### `cluster(digipins, method, options)`
Perform clustering analysis.

### Analysis Functions

#### `analyzeDensity(digipins, bounds, gridPrecision = 6)`
Analyze density distribution.

#### `findHotspots(digipins, threshold = 2, gridPrecision = 6)`
Find density hotspots.

## 🛠️ Configuration

### Precision Levels

| Level | Grid Size | Approximate Distance | Use Case |
|-------|-----------|---------------------|----------|
| 1-2   | 9° - 2.25° | 1000-250 km | Country/State |
| 3-4   | 33.75' - 8.44' | 62.5-15.6 km | District/Region |
| 5-6   | 2.11' - 0.53' | 3.9-1.0 km | City/Town |
| 7-8   | 0.13' - 0.03' | 250-60 m | Neighborhood |
| 9-10  | 0.008' - 0.002' | 15-3.8 m | Building/Address |

### Coverage Area

DIGIPIN covers India's geographic bounds:
- **Latitude**: 2.5°N to 38.5°N
- **Longitude**: 63.5°E to 99.5°E
- **Coordinate System**: WGS84 (EPSG:4326)

## 🧪 Testing

```bash
# Run test suite
npm test

# Run benchmarks
npm run benchmark
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache License, Version 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Department of Posts, Government of India** - Original DIGIPIN development
- **Indian Institute of Technology, Hyderabad** - Algorithm development
- **National Remote Sensing Centre, ISRO** - Geospatial expertise

## 📞 Support

For support and questions:
- 📧 Email: [Create an issue](https://github.com/CEPT-VZG/digipin/issues)
- 📖 Documentation: [GitHub Wiki](https://github.com/CEPT-VZG/digipin/wiki)
- 🐛 Bug Reports: [GitHub Issues](https://github.com/CEPT-VZG/digipin/issues)

---

**DIGIPIN Plus** - Transforming geospatial development for Digital India 🇮🇳
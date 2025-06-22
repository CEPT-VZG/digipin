#!/usr/bin/env node

/**
 * DIGIPIN Plus CLI Tool
 * Command-line interface for DIGIPIN operations
 */

const { program } = require('commander');
const digipinPlus = require('../index');

program
  .name('digipin-plus')
  .description('DIGIPIN Plus - Advanced DIGIPIN toolkit')
  .version('1.0.0');

// Encode command
program
  .command('encode')
  .description('Encode latitude and longitude to DIGIPIN')
  .argument('<lat>', 'Latitude')
  .argument('<lon>', 'Longitude')
  .option('-p, --precision <precision>', 'Precision level (1-10)', '10')
  .option('-j, --json', 'Output as JSON')
  .action((lat, lon, options) => {
    try {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);
      const precision = parseInt(options.precision);
      
      if (isNaN(latitude) || isNaN(longitude)) {
        console.error('Error: Invalid coordinates');
        process.exit(1);
      }
      
      const result = digipinPlus.encode(latitude, longitude, precision);
      
      if (options.json) {
        console.log(JSON.stringify({
          digipin: result,
          coordinates: { latitude, longitude },
          precision: precision
        }, null, 2));
      } else {
        console.log(result);
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Decode command
program
  .command('decode')
  .description('Decode DIGIPIN to coordinates')
  .argument('<digipin>', 'DIGIPIN code')
  .option('-j, --json', 'Output as JSON')
  .option('-s, --simple', 'Simple output format')
  .action((digipin, options) => {
    try {
      const result = digipinPlus.decode(digipin);
      
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else if (options.simple) {
        console.log(`${result.latitude}, ${result.longitude}`);
      } else {
        console.log(`Latitude: ${result.latitude}`);
        console.log(`Longitude: ${result.longitude}`);
        console.log(`Precision: ${result.precision}`);
        console.log(`Accuracy: ~${Math.round(result.accuracy.approximateMeters)}m`);
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Validate command
program
  .command('validate')
  .description('Validate DIGIPIN format')
  .argument('<digipin>', 'DIGIPIN code')
  .option('-j, --json', 'Output as JSON')
  .action((digipin, options) => {
    try {
      const result = digipinPlus.validate(digipin);
      
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`Valid: ${result.isValid}`);
        if (result.errors.length > 0) {
          console.log('Errors:');
          result.errors.forEach(error => console.log(`  - ${error}`));
        }
        if (result.warnings.length > 0) {
          console.log('Warnings:');
          result.warnings.forEach(warning => console.log(`  - ${warning}`));
        }
        if (result.info) {
          console.log(`Precision: ${result.info.precision}`);
          console.log(`Estimated Accuracy: ${result.info.estimatedAccuracy.description}`);
        }
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Distance command
program
  .command('distance')
  .description('Calculate distance between two DIGIPINs')
  .argument('<digipin1>', 'First DIGIPIN')
  .argument('<digipin2>', 'Second DIGIPIN')
  .option('-u, --unit <unit>', 'Output unit (m, km, mi)', 'm')
  .option('-j, --json', 'Output as JSON')
  .action((digipin1, digipin2, options) => {
    try {
      const distanceM = digipinPlus.distance(digipin1, digipin2);
      
      let distance = distanceM;
      let unit = 'm';
      
      if (options.unit === 'km') {
        distance = distanceM / 1000;
        unit = 'km';
      } else if (options.unit === 'mi') {
        distance = distanceM / 1609.34;
        unit = 'mi';
      }
      
      if (options.json) {
        console.log(JSON.stringify({
          digipin1,
          digipin2,
          distance: Math.round(distance * 100) / 100,
          unit,
          distanceMeters: distanceM
        }, null, 2));
      } else {
        console.log(`${Math.round(distance * 100) / 100} ${unit}`);
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Neighbors command
program
  .command('neighbors')
  .description('Find neighbors of a DIGIPIN')
  .argument('<digipin>', 'DIGIPIN code')
  .option('-r, --radius <radius>', 'Neighbor radius', '1')
  .option('-j, --json', 'Output as JSON')
  .action((digipin, options) => {
    try {
      const radius = parseInt(options.radius);
      const result = digipinPlus.neighbors(digipin, radius);
      
      if (options.json) {
        console.log(JSON.stringify({
          center: digipin,
          radius: radius,
          neighbors: result,
          count: result.length
        }, null, 2));
      } else {
        console.log(`Neighbors of ${digipin} (radius: ${radius}):`);
        result.forEach(neighbor => console.log(`  ${neighbor}`));
        console.log(`Total: ${result.length} neighbors`);
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Grid command
program
  .command('grid')
  .description('Generate DIGIPIN grid for an area')
  .option('-n, --north <north>', 'North boundary', '28.7')
  .option('-s, --south <south>', 'South boundary', '28.5')
  .option('-e, --east <east>', 'East boundary', '77.3')
  .option('-w, --west <west>', 'West boundary', '77.1')
  .option('-p, --precision <precision>', 'Grid precision', '6')
  .option('-c, --count', 'Show count only')
  .option('-j, --json', 'Output as JSON')
  .action((options) => {
    try {
      const bounds = {
        north: parseFloat(options.north),
        south: parseFloat(options.south),
        east: parseFloat(options.east),
        west: parseFloat(options.west)
      };
      
      const precision = parseInt(options.precision);
      const grid = digipinPlus.generateGrid(bounds, precision);
      
      if (options.json) {
        console.log(JSON.stringify({
          bounds,
          precision,
          grid: options.count ? undefined : grid,
          count: grid.length
        }, null, 2));
      } else if (options.count) {
        console.log(`Grid contains ${grid.length} DIGIPINs`);
      } else {
        console.log(`Generated grid (${grid.length} DIGIPINs):`);
        grid.forEach(digipin => console.log(digipin));
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Batch encode command
program
  .command('batch-encode')
  .description('Encode multiple coordinates from CSV')
  .argument('<file>', 'CSV file with lat,lon columns')
  .option('-p, --precision <precision>', 'Precision level', '10')
  .option('-o, --output <output>', 'Output file')
  .action((file, options) => {
    const fs = require('fs');
    const path = require('path');
    
    try {
      if (!fs.existsSync(file)) {
        console.error(`Error: File ${file} not found`);
        process.exit(1);
      }
      
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.trim().split('\n');
      const headers = lines[0].split(',');
      
      const latIndex = headers.findIndex(h => h.toLowerCase().includes('lat'));
      const lonIndex = headers.findIndex(h => h.toLowerCase().includes('lon'));
      
      if (latIndex === -1 || lonIndex === -1) {
        console.error('Error: CSV must contain latitude and longitude columns');
        process.exit(1);
      }
      
      const precision = parseInt(options.precision);
      const results = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const lat = parseFloat(values[latIndex]);
        const lon = parseFloat(values[lonIndex]);
        
        if (!isNaN(lat) && !isNaN(lon)) {
          const digipin = digipinPlus.encode(lat, lon, precision);
          results.push({ lat, lon, digipin });
        }
      }
      
      const output = results.map(r => `${r.lat},${r.lon},${r.digipin}`).join('\n');
      const finalOutput = `latitude,longitude,digipin\n${output}`;
      
      if (options.output) {
        fs.writeFileSync(options.output, finalOutput);
        console.log(`Encoded ${results.length} coordinates to ${options.output}`);
      } else {
        console.log(finalOutput);
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Info command
program
  .command('info')
  .description('Show DIGIPIN information and examples')
  .action(() => {
    console.log('DIGIPIN Plus - Advanced DIGIPIN Toolkit');
    console.log('=====================================');
    console.log('');
    console.log('DIGIPIN is a geocoding system developed by India Post');
    console.log('that encodes geographic coordinates into 10-character alphanumeric codes.');
    console.log('');
    console.log('Examples:');
    console.log('  Delhi (Red Fort): 39J-438-TJC7');
    console.log('  Mumbai (Gateway): 543-LCL-9FJ8');
    console.log('  Chennai (Marina): 765-332-MK4P');
    console.log('');
    console.log('Precision Levels:');
    console.log('  1-2 chars: State/Country level (~1000-250 km)');
    console.log('  3-4 chars: District level (~62-15 km)');
    console.log('  5-6 chars: City level (~4-1 km)');
    console.log('  7-8 chars: Neighborhood level (~250-60 m)');
    console.log('  9-10 chars: Building level (~15-4 m)');
    console.log('');
    console.log('Coverage: India (2.5°-38.5°N, 63.5°-99.5°E)');
  });

// Parse command line arguments
program.parse();

module.exports = program;
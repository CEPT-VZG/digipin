#!/usr/bin/env node

/**
 * DIGIPIN CLI Tool
 * 
 * Command-line interface for DIGIPIN operations
 */

import { program } from 'commander';
import { 
  encode, 
  decode, 
  calculateDigipinDistance,
  calculateDigipinBearing,
  getNeighbors,
  batchEncodeSync,
  batchDecodeSync,
  validateDigipinFormat
} from '../index';

// Package info
const packageInfo = require('../../package.json');

program
  .name('digipin')
  .description('CLI tool for DIGIPIN operations')
  .version(packageInfo.version);

// Encode command
program
  .command('encode <latitude> <longitude>')
  .description('Encode coordinates to DIGIPIN')
  .option('-f, --format', 'Include hyphens in output', true)
  .option('-r, --raw', 'Output raw DIGIPIN without hyphens')
  .action((lat: string, lon: string, options) => {
    try {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);
      
      if (isNaN(latitude) || isNaN(longitude)) {
        console.error('Error: Invalid coordinates. Please provide numeric values.');
        process.exit(1);
      }
      
      const digipin = encode(latitude, longitude, { format: !options.raw });
      console.log(digipin);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Decode command
program
  .command('decode <digipin>')
  .description('Decode DIGIPIN to coordinates')
  .option('-j, --json', 'Output as JSON')
  .action((digipin: string, options) => {
    try {
      const coords = decode(digipin);
      
      if (options.json) {
        console.log(JSON.stringify(coords, null, 2));
      } else {
        console.log(`${coords.latitude}, ${coords.longitude}`);
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Validate command
program
  .command('validate <digipin>')
  .description('Validate DIGIPIN format')
  .action((digipin: string) => {
    try {
      const validation = validateDigipinFormat(digipin);
      
      if (validation.valid) {
        console.log('✓ Valid DIGIPIN');
        process.exit(0);
      } else {
        console.log('✗ Invalid DIGIPIN:', validation.error);
        process.exit(1);
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Distance command
program
  .command('distance <digipin1> <digipin2>')
  .description('Calculate distance between two DIGIPINs')
  .option('-u, --unit <unit>', 'Output unit (m|km|miles)', 'km')
  .action((digipin1: string, digipin2: string, options) => {
    try {
      const distance = calculateDigipinDistance(digipin1, digipin2);
      
      switch (options.unit) {
        case 'm':
        case 'meters':
          console.log(`${distance.meters} meters`);
          break;
        case 'miles':
          console.log(`${distance.miles} miles`);
          break;
        case 'km':
        case 'kilometers':
        default:
          console.log(`${distance.kilometers} km`);
          break;
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Bearing command
program
  .command('bearing <digipin1> <digipin2>')
  .description('Calculate bearing between two DIGIPINs')
  .action((digipin1: string, digipin2: string) => {
    try {
      const bearing = calculateDigipinBearing(digipin1, digipin2);
      console.log(`Initial bearing: ${bearing.initial}°`);
      console.log(`Final bearing: ${bearing.final}°`);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Neighbors command
program
  .command('neighbors <digipin>')
  .description('Find neighboring DIGIPINs')
  .option('-d, --diagonals', 'Include diagonal neighbors', true)
  .option('-a, --adjacent-only', 'Only adjacent neighbors (no diagonals)')
  .option('-j, --json', 'Output as JSON')
  .action((digipin: string, options) => {
    try {
      const neighbors = getNeighbors(digipin, {
        includeDiagonals: options.adjacentOnly ? false : options.diagonals
      });
      
      if (options.json) {
        console.log(JSON.stringify(neighbors, null, 2));
      } else {
        console.log(`Found ${neighbors.length} neighbors:`);
        neighbors.forEach(neighbor => {
          console.log(`  ${neighbor.digipin} (${neighbor.center.latitude}, ${neighbor.center.longitude})`);
        });
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Batch encode command
program
  .command('batch-encode <file>')
  .description('Encode coordinates from CSV file')
  .option('-o, --output <file>', 'Output file (default: stdout)')
  .action((file: string, options) => {
    console.error('Batch operations from files not yet implemented. Use the programmatic API instead.');
    process.exit(1);
  });

// Help command
program
  .command('help [command]')
  .description('Display help for command')
  .action((command) => {
    if (command) {
      program.help();
    } else {
      program.outputHelp();
    }
  });

// Examples command
program
  .command('examples')
  .description('Show usage examples')
  .action(() => {
    console.log(`
DIGIPIN CLI Examples:

Encode coordinates:
  digipin encode 12.9716 77.5946
  digipin encode 12.9716 77.5946 --raw

Decode DIGIPIN:
  digipin decode 4P3-JK8-52C9
  digipin decode 4P3JK852C9 --json

Validate DIGIPIN:
  digipin validate 4P3-JK8-52C9

Calculate distance:
  digipin distance 4P3-JK8-52C9 39J-438-TJC7
  digipin distance 4P3-JK8-52C9 39J-438-TJC7 --unit miles

Calculate bearing:
  digipin bearing 4P3-JK8-52C9 39J-438-TJC7

Find neighbors:
  digipin neighbors 4P3-JK8-52C9
  digipin neighbors 4P3-JK8-52C9 --adjacent-only
  digipin neighbors 4P3-JK8-52C9 --json
`);
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
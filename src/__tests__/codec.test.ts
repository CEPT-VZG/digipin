/**
 * Core DIGIPIN encoding/decoding tests
 */

import { encode, decode, validateCoordinates, sanitizeDigipin, formatDigipin, getBounds } from '../core/codec';
import { DigipinCoordinatesError, DigipinFormatError, DigipinBoundsError } from '../core/errors';

describe('DIGIPIN Core Functions', () => {
  describe('validateCoordinates', () => {
    it('should validate correct coordinates', () => {
      const coords = validateCoordinates(12.9716, 77.5946);
      expect(coords.latitude).toBe(12.9716);
      expect(coords.longitude).toBe(77.5946);
    });

    it('should throw error for coordinates outside India bounds', () => {
      expect(() => validateCoordinates(50, 77)).toThrow(DigipinBoundsError);
      expect(() => validateCoordinates(12, 120)).toThrow(DigipinBoundsError);
    });

    it('should throw error for invalid coordinate types', () => {
      expect(() => validateCoordinates('12' as any, 77)).toThrow(DigipinCoordinatesError);
      expect(() => validateCoordinates(NaN, 77)).toThrow(DigipinCoordinatesError);
      expect(() => validateCoordinates(Infinity, 77)).toThrow(DigipinCoordinatesError);
    });
  });

  describe('sanitizeDigipin', () => {
    it('should sanitize formatted DIGIPIN', () => {
      const result = sanitizeDigipin('J52-M8M-MPCT');
      expect(result).toBe('J52M8MMPCT');
    });

    it('should sanitize unformatted DIGIPIN', () => {
      const result = sanitizeDigipin('J52M8MMPCT');
      expect(result).toBe('J52M8MMPCT');
    });

    it('should handle lowercase input', () => {
      const result = sanitizeDigipin('j52-m8m-mpct');
      expect(result).toBe('J52M8MMPCT');
    });

    it('should throw error for invalid format', () => {
      expect(() => sanitizeDigipin('INVALID')).toThrow(DigipinFormatError);
      expect(() => sanitizeDigipin('J52-M8M-MPCX')).toThrow(DigipinFormatError);
    });
  });

  describe('formatDigipin', () => {
    it('should format DIGIPIN with hyphens', () => {
      const result = formatDigipin('J52M8MMPCT');
      expect(result).toBe('J52-M8M-MPCT');
    });

    it('should format already formatted DIGIPIN', () => {
      const result = formatDigipin('J52-M8M-MPCT');
      expect(result).toBe('J52-M8M-MPCT');
    });
  });

  describe('encode', () => {
    it('should encode Bangalore coordinates correctly', () => {
      const digipin = encode(12.9716, 77.5946);
      expect(digipin).toBe('4P3-JK8-52C9');
    });

    it('should encode Delhi coordinates correctly', () => {
      const digipin = encode(28.6139, 77.2090);
      expect(digipin).toBe('39J-438-TJC7');
    });

    it('should encode Mumbai coordinates correctly', () => {
      const digipin = encode(19.0760, 72.8777);
      expect(digipin).toBe('4FK-595-8823');
    });

    it('should encode without formatting when requested', () => {
      const digipin = encode(12.9716, 77.5946, { format: false });
      expect(digipin).toBe('4P3JK852C9');
    });

    it('should throw error for invalid coordinates', () => {
      expect(() => encode(50, 77)).toThrow(DigipinBoundsError);
    });
  });

  describe('decode', () => {
    it('should decode Bangalore DIGIPIN correctly', () => {
      const coords = decode('4P3-JK8-52C9');
      expect(coords.latitude).toBeCloseTo(12.9716, 4);
      expect(coords.longitude).toBeCloseTo(77.5946, 4);
    });

    it('should decode Delhi DIGIPIN correctly', () => {
      const coords = decode('39J-438-TJC7');
      expect(coords.latitude).toBeCloseTo(28.6139, 4);
      expect(coords.longitude).toBeCloseTo(77.2090, 4);
    });

    it('should decode Mumbai DIGIPIN correctly', () => {
      const coords = decode('4FK-595-8823');
      expect(coords.latitude).toBeCloseTo(19.0760, 4);
      expect(coords.longitude).toBeCloseTo(72.8777, 4);
    });

    it('should decode unformatted DIGIPIN', () => {
      const coords = decode('4P3JK852C9');
      expect(coords.latitude).toBeCloseTo(12.9716, 4);
      expect(coords.longitude).toBeCloseTo(77.5946, 4);
    });

    it('should throw error for invalid DIGIPIN', () => {
      expect(() => decode('INVALID')).toThrow(DigipinFormatError);
      expect(() => decode('J52-M8M-MPCX')).toThrow(DigipinFormatError);
    });
  });

  describe('getBounds', () => {
    it('should return correct bounds for a DIGIPIN', () => {
      const bounds = getBounds('4P3-JK8-52C9');
      expect(bounds.minLat).toBeLessThan(bounds.maxLat);
      expect(bounds.minLon).toBeLessThan(bounds.maxLon);
      expect(bounds.minLat).toBeGreaterThan(12.9);
      expect(bounds.maxLat).toBeLessThan(13.0);
      expect(bounds.minLon).toBeGreaterThan(77.5);
      expect(bounds.maxLon).toBeLessThan(77.6);
    });
  });

  describe('encode/decode round-trip', () => {
    const testCases = [
      { lat: 12.9716, lon: 77.5946, name: 'Bangalore' },
      { lat: 28.6139, lon: 77.2090, name: 'Delhi' },
      { lat: 19.0760, lon: 72.8777, name: 'Mumbai' },
      { lat: 13.0827, lon: 80.2707, name: 'Chennai' },
      { lat: 22.5726, lon: 88.3639, name: 'Kolkata' }
    ];

    testCases.forEach(({ lat, lon, name }) => {
      it(`should encode and decode ${name} coordinates correctly`, () => {
        const digipin = encode(lat, lon);
        const decoded = decode(digipin);
        
        // Should be accurate to about 4 decimal places (roughly 10-15 meters)
        expect(decoded.latitude).toBeCloseTo(lat, 4);
        expect(decoded.longitude).toBeCloseTo(lon, 4);
      });
    });
  });
});
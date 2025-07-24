const { getDigiPin, getLatLngFromDigiPin } = require('../src/digipin');

describe('DIGIPIN Core Functions', () => {
  describe('getDigiPin', () => {
    it('should encode valid coordinates to DIGIPIN', () => {
      const digipin = getDigiPin(12.9716, 77.5946);
      expect(typeof digipin).toBe('string');
      expect(digipin).toMatch(/^[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{4}$/);
    });

    it('should throw error for latitude below minimum', () => {
      expect(() => {
        getDigiPin(2.4, 77.5946);
      }).toThrow('Latitude out of range');
    });

    it('should throw error for latitude above maximum', () => {
      expect(() => {
        getDigiPin(38.6, 77.5946);
      }).toThrow('Latitude out of range');
    });

    it('should throw error for longitude below minimum', () => {
      expect(() => {
        getDigiPin(12.9716, 63.4);
      }).toThrow('Longitude out of range');
    });

    it('should throw error for longitude above maximum', () => {
      expect(() => {
        getDigiPin(12.9716, 99.6);
      }).toThrow('Longitude out of range');
    });

    it('should handle minimum valid coordinates', () => {
      const digipin = getDigiPin(2.5, 63.5);
      expect(typeof digipin).toBe('string');
      expect(digipin).toMatch(/^[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{4}$/);
    });

    it('should handle maximum valid coordinates', () => {
      const digipin = getDigiPin(38.5, 99.5);
      expect(typeof digipin).toBe('string');
      expect(digipin).toMatch(/^[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{4}$/);
    });

    it('should produce different DIGIPINs for different coordinates', () => {
      const digipin1 = getDigiPin(12.9716, 77.5946);
      const digipin2 = getDigiPin(12.9717, 77.5947);
      expect(digipin1).not.toBe(digipin2);
    });

    it('should produce consistent DIGIPINs for same coordinates', () => {
      const digipin1 = getDigiPin(12.9716, 77.5946);
      const digipin2 = getDigiPin(12.9716, 77.5946);
      expect(digipin1).toBe(digipin2);
    });
  });

  describe('getLatLngFromDigiPin', () => {
    it('should decode valid DIGIPIN to coordinates', () => {
      const coords = getLatLngFromDigiPin('4P3-JK8-52C9');
      expect(coords).toHaveProperty('latitude');
      expect(coords).toHaveProperty('longitude');
      expect(typeof coords.latitude).toBe('string');
      expect(typeof coords.longitude).toBe('string');
      expect(parseFloat(coords.latitude)).toBeGreaterThan(0);
      expect(parseFloat(coords.longitude)).toBeGreaterThan(0);
    });

    it('should throw error for DIGIPIN that is too short', () => {
      expect(() => {
        getLatLngFromDigiPin('4P3-JK8');
      }).toThrow('Invalid DIGIPIN');
    });

    it('should throw error for DIGIPIN with invalid characters', () => {
      expect(() => {
        getLatLngFromDigiPin('4P3-JK8-52C#');
      }).toThrow('Invalid character in DIGIPIN');
    });

    it('should handle DIGIPIN without hyphens', () => {
      const coords = getLatLngFromDigiPin('4P3JK852C9');
      expect(coords).toHaveProperty('latitude');
      expect(coords).toHaveProperty('longitude');
    });

    it('should return coordinates with 6 decimal places', () => {
      const coords = getLatLngFromDigiPin('4P3-JK8-52C9');
      const latParts = coords.latitude.split('.');
      const lonParts = coords.longitude.split('.');
      
      if (latParts.length > 1) {
        expect(latParts[1].length).toBeLessThanOrEqual(6);
      }
      if (lonParts.length > 1) {
        expect(lonParts[1].length).toBeLessThanOrEqual(6);
      }
    });
  });

  describe('Round-trip encoding and decoding', () => {
    it('should encode and decode coordinates correctly', () => {
      const originalLat = 12.9716;
      const originalLon = 77.5946;

      const digipin = getDigiPin(originalLat, originalLon);
      const coords = getLatLngFromDigiPin(digipin);

      const decodedLat = parseFloat(coords.latitude);
      const decodedLon = parseFloat(coords.longitude);

      // Check that decoded coordinates are close to original (within reasonable tolerance)
      expect(Math.abs(decodedLat - originalLat)).toBeLessThan(0.001);
      expect(Math.abs(decodedLon - originalLon)).toBeLessThan(0.001);
    });

    it('should work with different coordinate ranges', () => {
      const testCases = [
        { lat: 2.5, lon: 63.5 },   // Minimum values
        { lat: 38.5, lon: 99.5 },  // Maximum values
        { lat: 20.5937, lon: 78.9629 }, // Center of India
        { lat: 28.6139, lon: 77.2090 }, // New Delhi
        { lat: 19.0760, lon: 72.8777 }, // Mumbai
      ];

      testCases.forEach(({ lat, lon }) => {
        const digipin = getDigiPin(lat, lon);
        const coords = getLatLngFromDigiPin(digipin);

        const decodedLat = parseFloat(coords.latitude);
        const decodedLon = parseFloat(coords.longitude);

        expect(Math.abs(decodedLat - lat)).toBeLessThan(0.001);
        expect(Math.abs(decodedLon - lon)).toBeLessThan(0.001);
      });
    });
  });

  describe('DIGIPIN format validation', () => {
    it('should always produce 10-character DIGIPINs (excluding hyphens)', () => {
      const digipin = getDigiPin(12.9716, 77.5946);
      const cleanDigipin = digipin.replace(/-/g, '');
      expect(cleanDigipin.length).toBe(10);
    });

    it('should always include hyphens at positions 3 and 6', () => {
      const digipin = getDigiPin(12.9716, 77.5946);
      expect(digipin.charAt(3)).toBe('-');
      expect(digipin.charAt(7)).toBe('-');
    });

    it('should only use valid DIGIPIN characters', () => {
      const validChars = ['2', '3', '4', '5', '6', '7', '8', '9', 'C', 'F', 'J', 'K', 'L', 'M', 'P', 'T'];
      const digipin = getDigiPin(12.9716, 77.5946);
      const cleanDigipin = digipin.replace(/-/g, '');

      for (let char of cleanDigipin) {
        expect(validChars).toContain(char);
      }
    });
  });
});

const { getDigiPin, getLatLngFromDigiPin } = require('../digipin');

describe('DIGIPIN Encoder and Decoder Tests', () => {
  
  describe('getDigiPin - Encoding Tests', () => {
    
    test('should encode valid coordinates within India bounds', () => {
      // Test Delhi coordinates
      const delhiLat = 28.6139;
      const delhiLon = 77.2090;
      const digiPin = getDigiPin(delhiLat, delhiLon);
      
      expect(digiPin).toBeTruthy();
      expect(digiPin.length).toBe(12); // 10 characters + 2 hyphens
      expect(digiPin).toBe("39J-438-TJC7");
    });
    
    test('should encode Mumbai coordinates', () => {
      const mumbaiLat = 19.0760;
      const mumbaiLon = 72.8777;
      const digiPin = getDigiPin(mumbaiLat, mumbaiLon);
      
      expect(digiPin).toBeTruthy();
      expect(digiPin.length).toBe(12);
      expect(digiPin).toBe("4FK-595-8823");
    });
    
    test('should encode coordinates at boundary limits', () => {
      // Test minimum bounds
      const minPin = getDigiPin(2.5, 63.5);
      expect(minPin).toBeTruthy();
      expect(minPin.length).toBe(12);
      expect(minPin).toBe("LLL-LLL-LLLL");
      
      // Test maximum bounds
      const maxPin = getDigiPin(38.5, 99.5);
      expect(maxPin).toBeTruthy();
      expect(maxPin.length).toBe(12);
      expect(maxPin).toBe("888-888-8888");
    });
    
    test('should throw error for latitude out of range', () => {
      expect(() => getDigiPin(1.0, 75.0)).toThrow('Latitude out of range');
      expect(() => getDigiPin(40.0, 75.0)).toThrow('Latitude out of range');
      expect(() => getDigiPin(-5.0, 75.0)).toThrow('Latitude out of range');
      expect(() => getDigiPin(50.0, 75.0)).toThrow('Latitude out of range');
    });
    
    test('should throw error for longitude out of range', () => {
      expect(() => getDigiPin(25.0, 60.0)).toThrow('Longitude out of range');
      expect(() => getDigiPin(25.0, 100.0)).toThrow('Longitude out of range');
      expect(() => getDigiPin(25.0, -10.0)).toThrow('Longitude out of range');
      expect(() => getDigiPin(25.0, 150.0)).toThrow('Longitude out of range');
    });
  });
  
  describe('getLatLngFromDigiPin - Decoding Tests', () => {
    
    test('should decode valid DIGIPIN with hyphens', () => {
      const testPin = '39J-438-TJC7';
      const result = getLatLngFromDigiPin(testPin);
      
      expect(result).toHaveProperty('latitude');
      expect(parseFloat(result.latitude)).toBeGreaterThanOrEqual(2.5);
      expect(parseFloat(result.latitude)).toBeLessThanOrEqual(38.5);
      expect(result.latitude).toBe("28.613901")

      expect(result).toHaveProperty('longitude');
      expect(parseFloat(result.longitude)).toBeGreaterThanOrEqual(63.5);
      expect(parseFloat(result.longitude)).toBeLessThanOrEqual(99.5);
      expect(result.longitude).toBe("77.208998");
    });
    
    test('should decode valid DIGIPIN without hyphens', () => {
      const testPin = '39J438TJC7';
      const result = getLatLngFromDigiPin(testPin);
      
      expect(result).toHaveProperty('latitude');
      expect(parseFloat(result.latitude)).toBeGreaterThanOrEqual(2.5);
      expect(parseFloat(result.latitude)).toBeLessThanOrEqual(38.5);
      expect(result.latitude).toBe("28.613901")

      expect(result).toHaveProperty('longitude');
      expect(parseFloat(result.longitude)).toBeGreaterThanOrEqual(63.5);
      expect(parseFloat(result.longitude)).toBeLessThanOrEqual(99.5);
      expect(result.longitude).toBe("77.208998");
    });
    
    test('should return coordinates with 6 decimal places', () => {
      const testPin = '39J-438-TJC7';
      const result = getLatLngFromDigiPin(testPin);
      
      expect(result.latitude).toMatch(/^\d+\.\d{6}$/);
      expect(result.longitude).toMatch(/^\d+\.\d{6}$/);
    });
    
    test('should throw error for invalid DIGIPIN length', () => {
      expect(() => getLatLngFromDigiPin('FCJ3K4')).toThrow('Invalid DIGIPIN');
      expect(() => getLatLngFromDigiPin('')).toThrow('Invalid DIGIPIN');
      expect(() => getLatLngFromDigiPin('FCJ-3K4-LM295')).toThrow('Invalid DIGIPIN');
    });
    
    test('should throw error for invalid characters in DIGIPIN', () => {
      expect(() => getLatLngFromDigiPin('FCJXK4LM29')).toThrow('Invalid character in DIGIPIN');
      expect(() => getLatLngFromDigiPin('FCJ3K4LM2A')).toThrow('Invalid character in DIGIPIN');
      expect(() => getLatLngFromDigiPin('FCJ3K4LM2@')).toThrow('Invalid character in DIGIPIN');
      expect(() => getLatLngFromDigiPin('FCJ3K4LM21')).toThrow('Invalid character in DIGIPIN');
    });

  });
});
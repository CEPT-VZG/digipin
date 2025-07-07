const { getDigipinGlobal, getLatLngFromDigiPinGlobal } = require("../digipinglobal");

describe('DIGIPIN Global Encoder Tests', () => {
  
  describe('getDigipinGlobal - Encoding Tests', () => {
    
    test('should encode valid coordinates within India bounds (Zone 0,0)', () => {
      // Test Delhi coordinates
      const delhiLat = 28.6139;
      const delhiLon = 77.2090;
      const digiPin = getDigipinGlobal(delhiLat, delhiLon);
      
      expect(digiPin).toBeTruthy();
      expect(digiPin.length).toBe(15); // 3 + 10 characters + 2 hyphens
      expect(digiPin).toBe("00-39J-438-TJC7");
    });

    test('should encode coordinates in different latitude zones', () => {
      // Zone 1: 38.5 to 74.5
      const lat1 = 50.0;
      const lon1 = 77.0;
      const digiPin1 = getDigipinGlobal(lat1, lon1);
      expect(digiPin1).toMatch(/^10-/);
      
      // Zone 2: 74.5 to 90.1
      const lat2 = 80.0;
      const lon2 = 77.0;
      const digiPin2 = getDigipinGlobal(lat2, lon2);
      expect(digiPin2).toMatch(/^20-/);
      
      // Zone 3: -33.5 to 2.5
      const lat3 = -10.0;
      const lon3 = 77.0;
      const digiPin3 = getDigipinGlobal(lat3, lon3);
      expect(digiPin3).toMatch(/^30-/);
      
      // Zone 4: -69.5 to -33.5
      const lat4 = -50.0;
      const lon4 = 77.0;
      const digiPin4 = getDigipinGlobal(lat4, lon4);
      expect(digiPin4).toMatch(/^40-/);
      
      // Zone 5: -90.1 to -69.5
      const lat5 = -80.0;
      const lon5 = 77.0;
      const digiPin5 = getDigipinGlobal(lat5, lon5);
      expect(digiPin5).toMatch(/^50-/);
    });

    test('should encode coordinates in different longitude zones', () => {
      const lat = 28.0;
      
      // Zone 0: 63.5 to 99.5 (India)
      const digiPin0 = getDigipinGlobal(lat, 80.0);
      expect(digiPin0).toMatch(/^00-/);
      
      // Zone 1: 99.5 to 135.5 (East Asia)
      const digiPin1 = getDigipinGlobal(lat, 120.0);
      expect(digiPin1).toMatch(/^01-/);
      
      // Zone 2: 135.5 to 171.5 (Pacific)
      const digiPin2 = getDigipinGlobal(lat, 150.0);
      expect(digiPin2).toMatch(/^02-/);
      
      // Zone 3: 171.5 to 180.0 and -180 to -152.5 (Pacific crossing)
      const digiPin3a = getDigipinGlobal(lat, 175.0);
      expect(digiPin3a).toMatch(/^03-/);
      const digiPin3b = getDigipinGlobal(lat, -170.0);
      expect(digiPin3b).toMatch(/^03-/);
      
      // Zone 4: -152.5 to -116.5 (North America West)
      const digiPin4 = getDigipinGlobal(lat, -130.0);
      expect(digiPin4).toMatch(/^04-/);
      
      // Zone 5: -116.5 to -80.5 (North America Central)
      const digiPin5 = getDigipinGlobal(lat, -100.0);
      expect(digiPin5).toMatch(/^05-/);
      
      // Zone 6: -80.5 to -44.5 (North America East)
      const digiPin6 = getDigipinGlobal(lat, -60.0);
      expect(digiPin6).toMatch(/^06-/);
      
      // Zone 7: -44.5 to -8.5 (Atlantic)
      const digiPin7 = getDigipinGlobal(lat, -25.0);
      expect(digiPin7).toMatch(/^07-/);
      
      // Zone 8: -8.5 to 27.5 (Europe/Africa)
      const digiPin8 = getDigipinGlobal(lat, 10.0);
      expect(digiPin8).toMatch(/^08-/);
      
      // Zone 9: 27.5 to 63.5 (Middle East)
      const digiPin9 = getDigipinGlobal(lat, 45.0);
      expect(digiPin9).toMatch(/^09-/);
    });

    test('should encode coordinates at boundary limits', () => {
      // Test near minimum latitude
      const minLatPin = getDigipinGlobal(2.5, 77.0);
      expect(minLatPin).toBeTruthy();
      expect(minLatPin.length).toBe(15);
      
      // Test near maximum latitude
      const maxLatPin = getDigipinGlobal(38.49, 77.0);
      expect(maxLatPin).toBeTruthy();
      expect(maxLatPin.length).toBe(15);
      
      // Test near minimum longitude
      const minLonPin = getDigipinGlobal(28.0, 63.5);
      expect(minLonPin).toBeTruthy();
      expect(minLonPin.length).toBe(15);
      
      // Test near maximum longitude
      const maxLonPin = getDigipinGlobal(28.0, 99.49);
      expect(maxLonPin).toBeTruthy();
      expect(maxLonPin.length).toBe(15);
    });

    test('should encode global coordinates correctly', () => {
      // New York
      const nyLat = 40.7128;
      const nyLon = -74.0060;
      const nyPin = getDigipinGlobal(nyLat, nyLon);
      expect(nyPin).toBeTruthy();
      expect(nyPin.length).toBe(15);
      expect(nyPin).toMatch(/^16-/);
      
      // London
      const londonLat = 51.5074;
      const londonLon = -0.1278;
      const londonPin = getDigipinGlobal(londonLat, londonLon);
      expect(londonPin).toBeTruthy();
      expect(londonPin.length).toBe(15);
      expect(londonPin).toMatch(/^18-/);
      
      // Tokyo
      const tokyoLat = 35.6762;
      const tokyoLon = 139.6503;
      const tokyoPin = getDigipinGlobal(tokyoLat, tokyoLon);
      expect(tokyoPin).toBeTruthy();
      expect(tokyoPin.length).toBe(15);
      expect(tokyoPin).toMatch(/^02-/);
      
      // Sydney
      const sydneyLat = -33.8688;
      const sydneyLon = 151.2093;
      const sydneyPin = getDigipinGlobal(sydneyLat, sydneyLon);
      expect(sydneyPin).toBeTruthy();
      expect(sydneyPin.length).toBe(15);
      expect(sydneyPin).toMatch(/^42-/);
      
      // Antarctica
      const antarcticaLat = -80.0;
      const antarcticaLon = 0.0;
      const antarcticaPin = getDigipinGlobal(antarcticaLat, antarcticaLon);
      expect(antarcticaPin).toBeTruthy();
      expect(antarcticaPin.length).toBe(15);
      expect(antarcticaPin).toMatch(/^58-/);
    });

    test('should handle edge cases for latitude zones', () => {
      // Test exact boundary values
      expect(getDigipinGlobal(2.5, 77.0)).toMatch(/^00-/);
      expect(getDigipinGlobal(38.49, 77.0)).toMatch(/^00-/);
      expect(getDigipinGlobal(38.5, 77.0)).toMatch(/^10-/);
      expect(getDigipinGlobal(74.49, 77.0)).toMatch(/^10-/);
      expect(getDigipinGlobal(74.5, 77.0)).toMatch(/^20-/);
      expect(getDigipinGlobal(-33.49, 77.0)).toMatch(/^30-/);
      expect(getDigipinGlobal(-33.5, 77.0)).toMatch(/^30-/);
      expect(getDigipinGlobal(-69.49, 77.0)).toMatch(/^40-/);
      expect(getDigipinGlobal(-69.5, 77.0)).toMatch(/^40-/);
    });

    test('should handle edge cases for longitude zones', () => {
      const lat = 28.0;
      // Test exact boundary values
      expect(getDigipinGlobal(lat, 63.5)).toMatch(/^00-/);
      expect(getDigipinGlobal(lat, 99.49)).toMatch(/^00-/);
      expect(getDigipinGlobal(lat, 99.5)).toMatch(/^01-/);
      expect(getDigipinGlobal(lat, 135.49)).toMatch(/^01-/);
      expect(getDigipinGlobal(lat, 135.5)).toMatch(/^02-/);
      expect(getDigipinGlobal(lat, 171.49)).toMatch(/^02-/);
      expect(getDigipinGlobal(lat, 171.5)).toMatch(/^03-/);
      expect(getDigipinGlobal(lat, 180.0)).toMatch(/^03-/);
      expect(getDigipinGlobal(lat, -180.0)).toMatch(/^03-/);
      expect(getDigipinGlobal(lat, -152.49)).toMatch(/^04-/);
      expect(getDigipinGlobal(lat, -152.5)).toMatch(/^04-/);
    });

    test('should return consistent format for all valid coordinates', () => {
      const testCases = [
        [28.6139, 77.2090],
        [40.7128, -74.0060],
        [51.5074, -0.1278],
        [35.6762, 139.6503],
        [-33.8688, 151.2093],
        [0.0, 0.0],
        [89.0, 179.0],
        [-89.0, -179.0]
      ];

      testCases.forEach(([lat, lon]) => {
        const digiPin = getDigipinGlobal(lat, lon);
        expect(digiPin).toMatch(/^\d\d-[FCJ3K4529876LMPTfcj]{3}-[FCJ3K4529876LMPTfcj]{3}-[FCJ3K4529876LMPTfcj]{4}$/);
        expect(digiPin.length).toBe(15);
      });
    });
  });

  describe('Error Handling Tests', () => {
    
    test('should throw error for latitude out of bounds', () => {
      expect(() => getDigipinGlobal(91.0, 77.0)).toThrow('Latitude out of bounds');
      expect(() => getDigipinGlobal(-91.0, 77.0)).toThrow('Latitude out of bounds');
      expect(() => getDigipinGlobal(100.0, 77.0)).toThrow('Latitude out of bounds');
      expect(() => getDigipinGlobal(-100.0, 77.0)).toThrow('Latitude out of bounds');
    });
    
    test('should throw error for longitude out of bounds', () => {
      expect(() => getDigipinGlobal(28.0, 181.0)).toThrow('Longitude out of bounds');
      expect(() => getDigipinGlobal(28.0, -181.0)).toThrow('Longitude out of bounds');
      expect(() => getDigipinGlobal(28.0, 200.0)).toThrow('Longitude out of bounds');
      expect(() => getDigipinGlobal(28.0, -200.0)).toThrow('Longitude out of bounds');
    });

    test('should throw error for invalid latitude values', () => {
      expect(() => getDigipinGlobal(NaN, 77.0)).toThrow();
      expect(() => getDigipinGlobal(Infinity, 77.0)).toThrow();
      expect(() => getDigipinGlobal(-Infinity, 77.0)).toThrow();
    });

    test('should throw error for invalid longitude values', () => {
      expect(() => getDigipinGlobal(28.0, NaN)).toThrow();
      expect(() => getDigipinGlobal(28.0, Infinity)).toThrow();
      expect(() => getDigipinGlobal(28.0, -Infinity)).toThrow();
    });
  });

  describe('Precision and Accuracy Tests', () => {
    
    test('should handle high precision coordinates', () => {
      const preciseLat = 28.613901234567;
      const preciseLon = 77.209012345678;
      const digiPin = getDigipinGlobal(preciseLat, preciseLon);
      
      expect(digiPin).toBeTruthy();
      expect(digiPin.length).toBe(15);
      expect(digiPin).toMatch(/^00-/);
    });

    test('should be consistent for same coordinates', () => {
      const lat = 28.6139;
      const lon = 77.2090;
      
      const digiPin1 = getDigipinGlobal(lat, lon);
      const digiPin2 = getDigipinGlobal(lat, lon);
      const digiPin3 = getDigipinGlobal(lat, lon);
      
      expect(digiPin1).toBe(digiPin2);
      expect(digiPin2).toBe(digiPin3);
    });

    test('should handle coordinates with many decimal places', () => {
      const testCases = [
        [28.123456789, 77.987654321],
        [0.000001, 0.000001],
        [89.999999, 179.999999],
        [-89.999999, -179.999999]
      ];

      testCases.forEach(([lat, lon]) => {
        const digiPin = getDigipinGlobal(lat, lon);
        expect(digiPin).toBeTruthy();
        expect(digiPin.length).toBe(15);
      });
    });
  });

  describe('Zone Coverage Tests', () => {
    
    test('should cover all latitude zones', () => {
      const zones = [
        [20.0, 0], // Zone 0: 2.5 to 38.5
        [50.0, 1], // Zone 1: 38.5 to 74.5
        [80.0, 2], // Zone 2: 74.5 to 90.1
        [-10.0, 3], // Zone 3: -33.5 to 2.5
        [-50.0, 4], // Zone 4: -69.5 to -33.5
        [-80.0, 5]  // Zone 5: -90.1 to -69.5
      ];

      zones.forEach(([lat, expectedZone]) => {
        const digiPin = getDigipinGlobal(lat, 77.0);
        expect(digiPin.substring(0, 1)).toBe(expectedZone.toString());
      });
    });

    test('should cover all longitude zones', () => {
      const zones = [
        [80.0, 0],    // Zone 0: 63.5 to 99.5
        [120.0, 1],   // Zone 1: 99.5 to 135.5
        [150.0, 2],   // Zone 2: 135.5 to 171.5
        [175.0, 3],   // Zone 3: 171.5 to 180.0
        [-170.0, 3],  // Zone 3: -180 to -152.5
        [-130.0, 4],  // Zone 4: -152.5 to -116.5
        [-100.0, 5],  // Zone 5: -116.5 to -80.5
        [-60.0, 6],   // Zone 6: -80.5 to -44.5
        [-25.0, 7],   // Zone 7: -44.5 to -8.5
        [10.0, 8],    // Zone 8: -8.5 to 27.5
        [45.0, 9]     // Zone 9: 27.5 to 63.5
      ];

      zones.forEach(([lon, expectedZone]) => {
        const digiPin = getDigipinGlobal(28.0, lon);
        expect(digiPin.substring(1, 2)).toBe(expectedZone.toString());
      });
    });
  });

  describe('getLatLngFromDigiPinGlobal - Decoding Tests', () => {
    
    test('should decode valid Global DIGIPIN with hyphens', () => {
      const testPin = '00-39J-438-TJC7'; // Delhi coordinates
      const result = getLatLngFromDigiPinGlobal(testPin);
      
      expect(result).toHaveProperty('latitude');
      expect(parseFloat(result.latitude)).toBeGreaterThanOrEqual(-90);
      expect(parseFloat(result.latitude)).toBeLessThanOrEqual(90);
      expect(result.latitude).toBe("28.613901");

      expect(result).toHaveProperty('longitude');
      expect(parseFloat(result.longitude)).toBeGreaterThanOrEqual(-180);
      expect(parseFloat(result.longitude)).toBeLessThanOrEqual(180);
      expect(result.longitude).toBe("77.208998");
    });
    
    test('should decode valid Global DIGIPIN without hyphens', () => {
      const testPin = '0039J438TJC7'; // Delhi coordinates
      const result = getLatLngFromDigiPinGlobal(testPin);
      
      expect(result).toHaveProperty('latitude');
      expect(parseFloat(result.latitude)).toBeGreaterThanOrEqual(-90);
      expect(parseFloat(result.latitude)).toBeLessThanOrEqual(90);
      expect(result.latitude).toBe("28.613901");

      expect(result).toHaveProperty('longitude');
      expect(parseFloat(result.longitude)).toBeGreaterThanOrEqual(-180);
      expect(parseFloat(result.longitude)).toBeLessThanOrEqual(180);
      expect(result.longitude).toBe("77.208998");
    });
    
    test('should decode Global DIGIPIN from different zones', () => {
      // Zone 1,8 (London area)
      const londonPin = '18-FCJ-3K4-LM29'; // Approximate London coordinates
      const londonResult = getLatLngFromDigiPinGlobal(londonPin);
      expect(londonResult).toHaveProperty('latitude');
      expect(londonResult).toHaveProperty('longitude');
      expect(parseFloat(londonResult.latitude)).toBeGreaterThan(40);
      expect(parseFloat(londonResult.latitude)).toBeLessThan(80);
      expect(parseFloat(londonResult.longitude)).toBeGreaterThan(-10);
      expect(parseFloat(londonResult.longitude)).toBeLessThan(30);
      
      // Zone 0,2 (Tokyo area)
      const tokyoPin = '02-FCJ-3K4-LM29'; // Approximate Tokyo coordinates
      const tokyoResult = getLatLngFromDigiPinGlobal(tokyoPin);
      expect(tokyoResult).toHaveProperty('latitude');
      expect(tokyoResult).toHaveProperty('longitude');
      expect(parseFloat(tokyoResult.latitude)).toBeGreaterThan(2);
      expect(parseFloat(tokyoResult.latitude)).toBeLessThan(40);
      expect(parseFloat(tokyoResult.longitude)).toBeGreaterThan(135);
      expect(parseFloat(tokyoResult.longitude)).toBeLessThan(172);
      
      // Zone 4,2 (Sydney area)
      const sydneyPin = '42-FCJ-3K4-LM29'; // Approximate Sydney coordinates
      const sydneyResult = getLatLngFromDigiPinGlobal(sydneyPin);
      expect(sydneyResult).toHaveProperty('latitude');
      expect(sydneyResult).toHaveProperty('longitude');
      expect(parseFloat(sydneyResult.latitude)).toBeGreaterThan(-70);
      expect(parseFloat(sydneyResult.latitude)).toBeLessThan(-33);
      expect(parseFloat(sydneyResult.longitude)).toBeGreaterThan(135);
      expect(parseFloat(sydneyResult.longitude)).toBeLessThan(172);
    });
    
    test('should return coordinates with 6 decimal places', () => {
      const testPin = '00-39J-438-TJC7';
      const result = getLatLngFromDigiPinGlobal(testPin);
      
      expect(result.latitude).toMatch(/^-?\d+\.\d{6}$/);
      expect(result.longitude).toMatch(/^-?\d+\.\d{6}$/);
    });
    
    test('should throw error for invalid Global DIGIPIN length', () => {
      expect(() => getLatLngFromDigiPinGlobal('0FCJ3K4')).toThrow('Invalid Global DIGIPIN');
      expect(() => getLatLngFromDigiPinGlobal('')).toThrow('Invalid Global DIGIPIN');
      expect(() => getLatLngFromDigiPinGlobal('00-FCJ-3K4-LM295')).toThrow('Invalid Global DIGIPIN');
      expect(() => getLatLngFromDigiPinGlobal('0-FCJ-3K4-LM29')).toThrow('Invalid Global DIGIPIN');
    });
    
    test('should throw error for invalid zone codes', () => {
      expect(() => getLatLngFromDigiPinGlobal('60-FCJ-3K4-LM29')).toThrow('Invalid latitude zone code');
      expect(() => getLatLngFromDigiPinGlobal('3A-FCJ-3K4-LM29')).toThrow('Invalid longitude zone code');
    });
    
    test('should throw error for invalid characters in base DIGIPIN', () => {
      expect(() => getLatLngFromDigiPinGlobal('00-FCJXK4LM29')).toThrow('Invalid character in DIGIPIN');
      expect(() => getLatLngFromDigiPinGlobal('00-FCJ3K4LM2A')).toThrow('Invalid character in DIGIPIN');
      expect(() => getLatLngFromDigiPinGlobal('00-FCJ3K4LM2@')).toThrow('Invalid character in DIGIPIN');
      expect(() => getLatLngFromDigiPinGlobal('00-FCJ3K4LM21')).toThrow('Invalid character in DIGIPIN');
    });
    
    test('should handle edge cases for different zones', () => {
      // Test zone boundaries
      const testCases = [
        '00-LLL-LLL-LLLL', // Zone 0,0 - minimum bounds
        '00-888-888-8888', // Zone 0,0 - maximum bounds  
        '10-LLL-LLL-LLLL', // Zone 1,0 - latitude zone 1
        '20-LLL-LLL-LLLL', // Zone 2,0 - latitude zone 2
        '30-LLL-LLL-LLLL', // Zone 3,0 - latitude zone 3
        '40-LLL-LLL-LLLL', // Zone 4,0 - latitude zone 4
  
        '01-LLL-LLL-LLLL', // Zone 0,1 - longitude zone 1
        '02-LLL-LLL-LLLL', // Zone 0,2 - longitude zone 2
        '03-LLL-LLL-LLLL', // Zone 0,3 - longitude zone 3
        '04-LLL-LLL-LLLL', // Zone 0,4 - longitude zone 4
        '05-LLL-LLL-LLLL', // Zone 0,5 - longitude zone 5
        '06-LLL-LLL-LLLL', // Zone 0,6 - longitude zone 6
        '07-LLL-LLL-LLLL', // Zone 0,7 - longitude zone 7
        '08-LLL-LLL-LLLL', // Zone 0,8 - longitude zone 8
        '09-LLL-LLL-LLLL'  // Zone 0,9 - longitude zone 9
      ];
      
      testCases.forEach(testPin => {
        const result = getLatLngFromDigiPinGlobal(testPin);
        expect(result).toHaveProperty('latitude');
        expect(result).toHaveProperty('longitude');
        expect(parseFloat(result.latitude)).toBeGreaterThanOrEqual(-90);
        expect(parseFloat(result.latitude)).toBeLessThanOrEqual(90);
        expect(parseFloat(result.longitude)).toBeGreaterThanOrEqual(-180);
        expect(parseFloat(result.longitude)).toBeLessThanOrEqual(180);
      });
    });
    
    test('should be consistent with encoding - round trip test', () => {
      const testCoordinates = [
        [28.6139, 77.2090],   // Delhi (Zone 0,0)
        [40.7128, -74.0060],  // New York (Zone 1,6)
        [51.5074, -0.1278],   // London (Zone 1,8)
        [35.6762, 139.6503],  // Tokyo (Zone 0,2)
        [-33.8688, 151.2093], // Sydney (Zone 4,2)
        [0.0, 0.0],           // Equator/Prime Meridian (Zone 3,8)
        [80.0, 0.0],          // Arctic (Zone 2,8)
        [-80.0, 0.0]          // Antarctic (Zone 5,8)
      ];
      
      testCoordinates.forEach(([lat, lon]) => {
        const encoded = getDigipinGlobal(lat, lon);
        const decoded = getLatLngFromDigiPinGlobal(encoded);
        
        // Allow for small precision differences due to grid system
        expect(Math.abs(parseFloat(decoded.latitude) - lat)).toBeLessThan(0.1);
        expect(Math.abs(parseFloat(decoded.longitude) - lon)).toBeLessThan(0.1);
      });
    });
  });
});


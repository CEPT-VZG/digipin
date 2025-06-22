/**
 * Batch processing tests
 */

import { 
  batchEncode, 
  batchDecode,
  batchEncodeSync,
  batchDecodeSync,
  batchValidate
} from '../utils/batch';

describe('Batch Processing Utilities', () => {
  const testCoordinates = [
    { latitude: 12.9716, longitude: 77.5946 }, // Bangalore
    { latitude: 28.6139, longitude: 77.2090 }, // Delhi
    { latitude: 19.0760, longitude: 72.8777 }  // Mumbai
  ];

  const testDigipins = [
    '4P3-JK8-52C9', // Bangalore
    '39J-438-TJC7', // Delhi
    '4FK-595-8823'  // Mumbai
  ];

  describe('batchEncode', () => {
    it('should encode multiple coordinates successfully', async () => {
      const result = await batchEncode(testCoordinates);
      
      expect(result.stats.total).toBe(3);
      expect(result.stats.successful).toBe(3);
      expect(result.stats.failed).toBe(0);
      expect(result.results).toHaveLength(3);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle encoding errors gracefully', async () => {
      const badCoordinates = [
        ...testCoordinates,
        { latitude: 100, longitude: 200 } // Invalid coordinates
      ];
      
      const result = await batchEncode(badCoordinates, { errorStrategy: 'continue' });
      
      expect(result.stats.total).toBe(4);
      expect(result.stats.successful).toBe(3);
      expect(result.stats.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
    });

    it('should call progress callback', async () => {
      const progressCalls: number[] = [];
      
      await batchEncode(testCoordinates, {
        onProgress: (processed, total) => {
          progressCalls.push(processed);
        }
      });
      
      expect(progressCalls).toEqual([1, 2, 3]);
    });
  });

  describe('batchDecode', () => {
    it('should decode multiple DIGIPINs successfully', async () => {
      const result = await batchDecode(testDigipins);
      
      expect(result.stats.total).toBe(3);
      expect(result.stats.successful).toBe(3);
      expect(result.stats.failed).toBe(0);
      expect(result.results).toHaveLength(3);
    });

    it('should handle decoding errors gracefully', async () => {
      const badDigipins = [
        ...testDigipins,
        'INVALID-PIN' // Invalid DIGIPIN
      ];
      
      const result = await batchDecode(badDigipins, { errorStrategy: 'continue' });
      
      expect(result.stats.total).toBe(4);
      expect(result.stats.successful).toBe(3);
      expect(result.stats.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('batchValidate', () => {
    it('should validate multiple DIGIPINs', async () => {
      const mixedDigipins = [
        ...testDigipins,
        'INVALID-PIN'
      ];
      
      const result = await batchValidate(mixedDigipins);
      
      expect(result.stats.total).toBe(4);
      expect(result.stats.successful).toBe(4); // All processed, some just return false
      expect(result.results.filter(r => r)).toHaveLength(3); // 3 valid
      expect(result.results.filter(r => !r)).toHaveLength(1); // 1 invalid
    });
  });

  describe('batchEncodeSync', () => {
    it('should synchronously encode coordinates', () => {
      const result = batchEncodeSync(testCoordinates);
      
      expect(result.stats.total).toBe(3);
      expect(result.stats.successful).toBe(3);
      expect(result.stats.failed).toBe(0);
      expect(result.results).toHaveLength(3);
      expect(result.stats.duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('batchDecodeSync', () => {
    it('should synchronously decode DIGIPINs', () => {
      const result = batchDecodeSync(testDigipins);
      
      expect(result.stats.total).toBe(3);
      expect(result.stats.successful).toBe(3);
      expect(result.stats.failed).toBe(0);
      expect(result.results).toHaveLength(3);
      expect(result.stats.duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('round-trip batch processing', () => {
    it('should encode and decode coordinates correctly', async () => {
      const encodeResult = await batchEncode(testCoordinates);
      const decodeResult = await batchDecode(encodeResult.results);
      
      expect(decodeResult.stats.successful).toBe(testCoordinates.length);
      
      // Check that decoded coordinates are close to original
      decodeResult.results.forEach((decoded, index) => {
        const original = testCoordinates[index];
        expect(decoded.latitude).toBeCloseTo(original.latitude, 4);
        expect(decoded.longitude).toBeCloseTo(original.longitude, 4);
      });
    });
  });
});
/**
 * Distance calculation tests
 */

import { 
  calculateDistance, 
  calculateDigipinDistance,
  calculateBearing,
  calculateDigipinBearing,
  calculateMidpoint,
  calculateDigipinMidpoint
} from '../utils/distance';

describe('Distance Utilities', () => {
  const bangalore = { latitude: 12.9716, longitude: 77.5946 };
  const delhi = { latitude: 28.6139, longitude: 77.2090 };
  const bangaloreDigipin = '4P3-JK8-52C9';
  const delhiDigipin = '39J-438-TJC7';

  describe('calculateDistance', () => {
    it('should calculate distance between Bangalore and Delhi', () => {
      const distance = calculateDistance(bangalore, delhi);
      expect(distance.kilometers).toBeGreaterThan(1700);
      expect(distance.kilometers).toBeLessThan(1800);
      expect(distance.meters).toBeGreaterThan(1700000);
      expect(distance.miles).toBeGreaterThan(1000);
    });

    it('should return zero distance for same coordinates', () => {
      const distance = calculateDistance(bangalore, bangalore);
      expect(distance.meters).toBe(0);
      expect(distance.kilometers).toBe(0);
      expect(distance.miles).toBe(0);
    });
  });

  describe('calculateDigipinDistance', () => {
    it('should calculate distance between DIGIPINs', () => {
      const distance = calculateDigipinDistance(bangaloreDigipin, delhiDigipin);
      expect(distance.kilometers).toBeGreaterThan(1700);
      expect(distance.kilometers).toBeLessThan(1800);
    });
  });

  describe('calculateBearing', () => {
    it('should calculate bearing from Bangalore to Delhi', () => {
      const bearing = calculateBearing(bangalore, delhi);
      expect(bearing.initial).toBeGreaterThan(350); // Should be almost due north
      expect(bearing.initial).toBeLessThan(360);
      expect(bearing.final).toBeGreaterThan(0);
      expect(bearing.final).toBeLessThan(360);
    });
  });

  describe('calculateDigipinBearing', () => {
    it('should calculate bearing between DIGIPINs', () => {
      const bearing = calculateDigipinBearing(bangaloreDigipin, delhiDigipin);
      expect(bearing.initial).toBeGreaterThan(350); // Should be almost due north
      expect(bearing.initial).toBeLessThan(360);
    });
  });

  describe('calculateMidpoint', () => {
    it('should calculate midpoint between coordinates', () => {
      const midpoint = calculateMidpoint(bangalore, delhi);
      expect(midpoint.latitude).toBeGreaterThan(bangalore.latitude);
      expect(midpoint.latitude).toBeLessThan(delhi.latitude);
      expect(midpoint.longitude).toBeCloseTo(77.4, 1);
    });
  });

  describe('calculateDigipinMidpoint', () => {
    it('should calculate midpoint between DIGIPINs', () => {
      const midpoint = calculateDigipinMidpoint(bangaloreDigipin, delhiDigipin);
      expect(midpoint.latitude).toBeGreaterThan(bangalore.latitude);
      expect(midpoint.latitude).toBeLessThan(delhi.latitude);
    });
  });
});
/**
 * Distance calculation utilities for DIGIPIN coordinates
 */

import { Coordinates, DistanceResult, BearingResult, DigipinString } from '../types';
import { decode } from '../core/codec';
import { EARTH_RADIUS_METERS, EARTH_RADIUS_KM, METERS_TO_MILES } from '../core/constants';

/**
 * Converts degrees to radians
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Converts radians to degrees
 * @param radians - Angle in radians
 * @returns Angle in degrees
 */
function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Calculates the great circle distance between two coordinates using the Haversine formula
 * @param from - Starting coordinates
 * @param to - Ending coordinates
 * @returns Distance in meters, kilometers, and miles
 */
export function calculateDistance(from: Coordinates, to: Coordinates): DistanceResult {
  const lat1 = toRadians(from.latitude);
  const lon1 = toRadians(from.longitude);
  const lat2 = toRadians(to.latitude);
  const lon2 = toRadians(to.longitude);

  const deltaLat = lat2 - lat1;
  const deltaLon = lon2 - lon1;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  const meters = EARTH_RADIUS_METERS * c;
  const kilometers = meters / 1000;
  const miles = meters * METERS_TO_MILES;

  return {
    meters: Math.round(meters * 100) / 100,
    kilometers: Math.round(kilometers * 100) / 100,
    miles: Math.round(miles * 100) / 100
  };
}

/**
 * Calculates the distance between two DIGIPINs
 * @param from - Starting DIGIPIN
 * @param to - Ending DIGIPIN
 * @returns Distance in meters, kilometers, and miles
 */
export function calculateDigipinDistance(from: DigipinString, to: DigipinString): DistanceResult {
  const fromCoords = decode(from);
  const toCoords = decode(to);
  return calculateDistance(fromCoords, toCoords);
}

/**
 * Calculates the initial and final bearing between two coordinates
 * @param from - Starting coordinates
 * @param to - Ending coordinates
 * @returns Initial and final bearing in degrees
 */
export function calculateBearing(from: Coordinates, to: Coordinates): BearingResult {
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const deltaLon = toRadians(to.longitude - from.longitude);

  // Initial bearing
  const y = Math.sin(deltaLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);
  let initialBearing = toDegrees(Math.atan2(y, x));
  initialBearing = (initialBearing + 360) % 360; // Normalize to 0-360

  // Final bearing
  const lat3 = toRadians(to.latitude);
  const lat4 = toRadians(from.latitude);  
  const deltaLon2 = toRadians(from.longitude - to.longitude);

  const y2 = Math.sin(deltaLon2) * Math.cos(lat4);
  const x2 = Math.cos(lat3) * Math.sin(lat4) - Math.sin(lat3) * Math.cos(lat4) * Math.cos(deltaLon2);
  let finalBearing = toDegrees(Math.atan2(y2, x2));
  finalBearing = (finalBearing + 180) % 360; // Reverse direction and normalize

  return {
    initial: Math.round(initialBearing * 100) / 100,
    final: Math.round(finalBearing * 100) / 100
  };
}

/**
 * Calculates the bearing between two DIGIPINs
 * @param from - Starting DIGIPIN
 * @param to - Ending DIGIPIN
 * @returns Initial and final bearing in degrees
 */
export function calculateDigipinBearing(from: DigipinString, to: DigipinString): BearingResult {
  const fromCoords = decode(from);
  const toCoords = decode(to);
  return calculateBearing(fromCoords, toCoords);
}

/**
 * Calculates the midpoint between two coordinates
 * @param from - Starting coordinates
 * @param to - Ending coordinates
 * @returns Midpoint coordinates
 */
export function calculateMidpoint(from: Coordinates, to: Coordinates): Coordinates {
  const lat1 = toRadians(from.latitude);
  const lon1 = toRadians(from.longitude);
  const lat2 = toRadians(to.latitude);
  const lon2 = toRadians(to.longitude);

  const deltaLon = lon2 - lon1;

  const bx = Math.cos(lat2) * Math.cos(deltaLon);
  const by = Math.cos(lat2) * Math.sin(deltaLon);

  const lat3 = Math.atan2(
    Math.sin(lat1) + Math.sin(lat2),
    Math.sqrt((Math.cos(lat1) + bx) * (Math.cos(lat1) + bx) + by * by)
  );
  const lon3 = lon1 + Math.atan2(by, Math.cos(lat1) + bx);

  return {
    latitude: parseFloat(toDegrees(lat3).toFixed(6)),
    longitude: parseFloat(toDegrees(lon3).toFixed(6))
  };
}

/**
 * Calculates the midpoint between two DIGIPINs
 * @param from - Starting DIGIPIN
 * @param to - Ending DIGIPIN
 * @returns Midpoint coordinates
 */
export function calculateDigipinMidpoint(from: DigipinString, to: DigipinString): Coordinates {
  const fromCoords = decode(from);
  const toCoords = decode(to);
  return calculateMidpoint(fromCoords, toCoords);
}
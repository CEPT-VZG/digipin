/**
 * DIGIPIN Encoder and Decoder Library
 * Developed by India Post, Department of Posts
 * Released under an open-source license for public use
 *
 * This module contains two main functions:
 *  - getDigiPin(lat, lon): Encodes latitude & longitude into a 10-digit alphanumeric DIGIPIN
 *  - getLatLngFromDigiPin(digiPin): Decodes a DIGIPIN back into its central latitude & longitude
 */

const DIGIPIN_GRID = [
  ["F", "C", "9", "8"],
  ["J", "3", "2", "7"],
  ["K", "4", "5", "6"],
  ["L", "M", "P", "T"],
];

const BOUNDS = {
  minLat: 2.5,
  maxLat: 38.5,
  minLon: 63.5,
  maxLon: 99.5,
};

function getDigiPin(lat, lon) {
  if (lat < BOUNDS.minLat || lat > BOUNDS.maxLat)
    throw new Error("Latitude out of range");
  if (lon < BOUNDS.minLon || lon > BOUNDS.maxLon)
    throw new Error("Longitude out of range");

  let minLat = BOUNDS.minLat;
  let maxLat = BOUNDS.maxLat;
  let minLon = BOUNDS.minLon;
  let maxLon = BOUNDS.maxLon;

  let digiPin = "";

  for (let level = 1; level <= 10; level++) {
    const latDiv = (maxLat - minLat) / 4;
    const lonDiv = (maxLon - minLon) / 4;

    // REVERSED row logic (to match original)
    let row = 3 - Math.floor((lat - minLat) / latDiv);
    let col = Math.floor((lon - minLon) / lonDiv);

    row = Math.max(0, Math.min(row, 3));
    col = Math.max(0, Math.min(col, 3));

    digiPin += DIGIPIN_GRID[row][col];

    if (level === 3 || level === 6) digiPin += "-";

    // Update bounds (reverse logic for row)
    maxLat = minLat + latDiv * (4 - row);
    minLat = minLat + latDiv * (3 - row);

    minLon = minLon + lonDiv * col;
    maxLon = minLon + lonDiv;
  }

  return digiPin;
}

function getLatLngFromDigiPin(digiPin) {
  const pin = digiPin.replace(/-/g, "");
  if (pin.length !== 10) throw new Error("Invalid DIGIPIN");

  let minLat = BOUNDS.minLat;
  let maxLat = BOUNDS.maxLat;
  let minLon = BOUNDS.minLon;
  let maxLon = BOUNDS.maxLon;

  for (let i = 0; i < 10; i++) {
    const char = pin[i];
    let found = false;
    let ri = -1,
      ci = -1;

    // Locate character in DIGIPIN grid
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (DIGIPIN_GRID[r][c] === char) {
          ri = r;
          ci = c;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) throw new Error("Invalid character in DIGIPIN");

    const latDiv = (maxLat - minLat) / 4;
    const lonDiv = (maxLon - minLon) / 4;

    const lat1 = maxLat - latDiv * (ri + 1);
    const lat2 = maxLat - latDiv * ri;
    const lon1 = minLon + lonDiv * ci;
    const lon2 = minLon + lonDiv * (ci + 1);

    // Update bounding box for next level
    minLat = lat1;
    maxLat = lat2;
    minLon = lon1;
    maxLon = lon2;
  }

  const centerLat = (minLat + maxLat) / 2;
  const centerLon = (minLon + maxLon) / 2;

  return {
    latitude: centerLat.toFixed(6),
    longitude: centerLon.toFixed(6),
  };
}

/**
 * Parse DMS (Degrees, Minutes, Seconds) coordinate string to decimal degrees
 * Supports formats like: "12°54'10.3"N" or "77°36'22.3"E"
 */
function parseDMSCoordinate(dmsString) {
  // Remove spaces and match DMS pattern
  const dmsRegex = /(\d+)°(\d+)'([\d.]+)"([NSEW])/;
  const match = dmsString.trim().match(dmsRegex);

  if (!match) {
    throw new Error("Invalid DMS coordinate format");
  }

  const [, degrees, minutes, seconds, direction] = match;

  // Convert to decimal degrees
  let decimal =
    parseFloat(degrees) + parseFloat(minutes) / 60 + parseFloat(seconds) / 3600;

  // Apply negative for South/West
  if (direction === "S" || direction === "W") {
    decimal = -decimal;
  }

  return decimal;
}

function parseLatLongString(latLongString) {
  const parts = latLongString.trim().split(",");
  if (parts.length !== 2) {
    throw new Error(
      'Invalid Lat Long coordinate format. Expected format: "12.903006092657114, 77.60609302302365"'
    );
  }

  const lat = parseFloat(parts[0]);
  const lon = parseFloat(parts[1]);

  return { latitude: lat, longitude: lon };
}

/**
 * Parse full DMS coordinate string like "12°54'10.3"N 77°36'22.3"E"
 */
function parseDMSString(coordinateString) {
  // Split by space to separate lat and lon
  const parts = coordinateString.trim().split(/\s+/);

  if (parts.length !== 2) {
    throw new Error(
      'Invalid coordinate format. Expected format: "12°54\'10.3"N 77°36\'22.3"E"'
    );
  }

  const lat = parseDMSCoordinate(parts[0]);
  const lon = parseDMSCoordinate(parts[1]);

  return { latitude: lat, longitude: lon };
}

if (typeof module !== "undefined")
  module.exports = {
    getDigiPin,
    getLatLngFromDigiPin,
    parseDMSString,
    parseLatLongString,
  };

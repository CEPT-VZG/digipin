/**
 * DIGIPIN Encoder and Decoder Library
 * Developed by India Post, Department of Posts
 * Released under an open-source license for public use
 *
 * This module contains two main functions:
 * - getDigiPin(lat, lon, countryCode):
 *    Generates a DIGIPIN, which is an alphanumeric code of country-specific length,
 *    by encoding the provided latitude and longitude.
 * 
 * - getLatLngFromDigiPin(digiPin, countryCode): Decodes a DIGIPIN back into its central latitude & longitude as per specified country code
 */

const BOUNDS = {
    "IN":{
    length: 10,
    minLat: 2.5,
    maxLat: 38.5,
    minLon: 63.5,
    maxLon: 99.5
  }
};

const DIGIPIN_GRID = [
    ['F', 'C', '9', '8'],
    ['J', '3', '2', '7'],
    ['K', '4', '5', '6'],
    ['L', 'M', 'P', 'T']
  ];
  

  function getDigiPin(lat, lon, countryCode) {
    if (!BOUNDS[countryCode]) throw new Error('Unsupported country code');
    if (lat < BOUNDS[countryCode].minLat || lat > BOUNDS[countryCode].maxLat) throw new Error('Latitude out of range');
    if (lon < BOUNDS[countryCode].minLon || lon > BOUNDS[countryCode].maxLon) throw new Error('Longitude out of range');
  
    let minLat = BOUNDS[countryCode].minLat;
    let maxLat = BOUNDS[countryCode].maxLat;
    let minLon = BOUNDS[countryCode].minLon;
    let maxLon = BOUNDS[countryCode].maxLon;
  
    let digiPin = '';
    
    for (let level = 1; level <= BOUNDS[countryCode].length; level++) {
      const latDiv = (maxLat - minLat) / 4;
      const lonDiv = (maxLon - minLon) / 4;
  
      // REVERSED row logic (to match original)
      let row = 3 - Math.floor((lat - minLat) / latDiv);
      let col = Math.floor((lon - minLon) / lonDiv);
  
      row = Math.max(0, Math.min(row, 3));
      col = Math.max(0, Math.min(col, 3));
  
      digiPin += DIGIPIN_GRID[row][col];
  
      if (level === 3 || level === 6) digiPin += '-';
  
      // Update bounds (reverse logic for row)
      maxLat = minLat + latDiv * (4 - row);
      minLat = minLat + latDiv * (3 - row);
  
      minLon = minLon + lonDiv * col;
      maxLon = minLon + lonDiv;
    }
  
    return digiPin;
  }


  function getLatLngFromDigiPin(digiPin, countryCode) {
    const pin = digiPin.replace(/-/g, '');
    if (!BOUNDS[countryCode]) throw new Error('Unsupported country code');
    if (pin.length !== BOUNDS[countryCode].length) throw new Error('Invalid DIGIPIN');
    
    let minLat = BOUNDS[countryCode].minLat;
    let maxLat = BOUNDS[countryCode].maxLat;
    let minLon = BOUNDS[countryCode].minLon;
    let maxLon = BOUNDS[countryCode].maxLon;
  
    for (let i = 0; i < BOUNDS[countryCode].length; i++) {
      const char = pin[i];
      let found = false;
      let ri = -1, ci = -1;
  
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
  
      if (!found) throw new Error('Invalid character in DIGIPIN');
  
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
      longitude: centerLon.toFixed(6)
    };
  }
  
  
  if (typeof module !== 'undefined') module.exports = { getDigiPin, getLatLngFromDigiPin };
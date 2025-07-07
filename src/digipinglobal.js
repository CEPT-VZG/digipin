const { getDigiPin, getLatLngFromDigiPin } = require('./digipin.js');

function getLatitudeCode(lat) {
    const zones = [
        [2.5,    38.5,   0],
        [38.5,   74.5,   1],
        [74.5,   90.1,   2],
        [-33.5,   2.5,   3],
        [-69.5, -33.5,   4],
        [-90.1, -69.5,   5]
    ];
    for (let [minLat, maxLat, code] of zones) {
        if (lat >= minLat && lat < maxLat) return code;
    }
    throw new Error("Latitude out of bounds");
}

function getLongitudeCode(lon) {
    const zones = [
        [63.5,  99.5,   0],
        [99.5,  135.5,  1],
        [135.5, 171.5,  2],
        [171.5, 180.1,  3],
        [-180, -152.5, 3],
        [-152.5, -116.5, 4],
        [-116.5, -80.5, 5],
        [-80.5, -44.5, 6],
        [-44.5, -8.5, 7],
        [-8.5, 27.5, 8],
        [27.5, 63.5, 9]
    ];
    for (let [minLon, maxLon, code] of zones) {
        if (lon >= minLon && lon < maxLon) return code;
    }
    throw new Error("Longitude out of bounds");
}

function AdjustedLatitude(lat, latcode) {
    let diff;
    if (latcode < 3) {
        diff = latcode * 36;
        lat -= diff;
    } else {
        diff = (latcode - 2) * 36;
        lat += diff;
    }
    return lat;
}

function AdjustedLongitude(lon, loncode) {
    let diff;
    if (loncode === 1 || loncode === 2) {
        diff = loncode * 36;
        lon -= diff;
    } else if (loncode === 3 && lon >= 171.5 && lon <= 180.0) {
        lon -= loncode * 36;
    } else if (loncode === 3 && lon >= -180 && lon < -152.5) {
        lon += (10 - loncode) * 36;
    } else if (loncode >= 4) {
        diff = (10 - loncode) * 36;
        lon += diff;
    }
    return lon;
}

function getDigipinGlobal(lat, lon) {
    const minLat = -90, maxLat = 90;
    const minLon = -180, maxLon = 180;
    if (lat < minLat || lat > maxLat) throw new Error("Latitude out of bounds");
    if (lon < minLon || lon > maxLon) throw new Error("Longitude out of bounds");

    const latcode = getLatitudeCode(lat);
    const loncode = getLongitudeCode(lon);

    const adjustedLat = AdjustedLatitude(lat, latcode);
    const adjustedLon = AdjustedLongitude(lon, loncode);

    const digipin = `${latcode}${loncode}-${getDigiPin(adjustedLat, adjustedLon)}`;
    return digipin;
}


function getLatLngFromDigiPinGlobal(digiPin) {
    // Remove hyphens and validate format
    const pin = digiPin.replace(/-/g, '');
    if (pin.length !== 12) throw new Error('Invalid Global DIGIPIN');
    
    // Extract zone codes and base DIGIPIN
    const latcodeStr = pin[0];
    const loncodeStr = pin[1];
    const baseDigiPin = pin.slice(2);
    
    // Validate zone code characters are digits
    if (!/^\d$/.test(latcodeStr)) throw new Error('Invalid latitude zone code');
    if (!/^\d$/.test(loncodeStr)) throw new Error('Invalid longitude zone code');
    
    const latcode = parseInt(latcodeStr);
    const loncode = parseInt(loncodeStr);
    
    // Validate zone codes are in valid range
    if (latcode < 0 || latcode > 5) throw new Error('Invalid latitude zone code');
    if (loncode < 0 || loncode > 9) throw new Error('Invalid longitude zone code');

    
    // Add hyphens back to base DIGIPIN for decoding
    const formattedBasePin = baseDigiPin.slice(0, 3) + '-' + baseDigiPin.slice(3, 6) + '-' + baseDigiPin.slice(6, 10);
    
    // Decode the base DIGIPIN using the existing function
    const baseCoords = getLatLngFromDigiPin(formattedBasePin);
    
    // Convert adjusted coordinates back to global coordinates
    let globalLat = parseFloat(baseCoords.latitude);
    let globalLon = parseFloat(baseCoords.longitude);
    
    // Reverse the latitude adjustment
    if (latcode < 3) {
        const diff = latcode * 36;
        globalLat += diff;
    } else {
        const diff = (latcode - 2) * 36;
        globalLat -= diff;
    }
    
    // Reverse the longitude adjustment
    if (loncode === 1 || loncode === 2) {
        const diff = loncode * 36;
        globalLon += diff;
    } else if (loncode === 3) {
        // Handle zone 3 which spans 180° meridian
        // Need to reverse the complex logic from AdjustedLongitude
        const diff = (10 - loncode) * 36;  // This is 7 * 36 = 252
        globalLon -= diff;  // Reverse the addition
        // Handle the 180° crossing
        if (globalLon < -180) {
            globalLon += 360;
        }
    } else if (loncode >= 4) {
        const diff = (10 - loncode) * 36;
        globalLon -= diff;
    }
    

    return {
        latitude: globalLat.toFixed(6),
        longitude: globalLon.toFixed(6)
    };
}

module.exports = {
    getDigipinGlobal,
    getLatLngFromDigiPinGlobal
};
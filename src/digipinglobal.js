const { getDigiPin } = require('./digipin.js');

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

module.exports = {
    getDigipinGlobal
};
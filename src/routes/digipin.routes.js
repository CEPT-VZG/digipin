const express = require('express');
const router = express.Router();
const { getDigiPin, getLatLngFromDigiPin } = require('../digipin');
const { parseCoordinatePair, parseGoogleMapsCoords, validateCoordinates } = require('../utils/coordinateUtils');

router.post('/encode', (req, res) => {
  const { latitude, longitude, coordinates } = req.body;
  
  try {
    let lat, lng;
    
    // Handle Google Maps coordinate string format
    if (coordinates && typeof coordinates === 'string') {
      const parsed = parseGoogleMapsCoords(coordinates);
      lat = parsed.latitude;
      lng = parsed.longitude;
    }
    // Handle individual latitude/longitude (supports DMS and decimal)
    else if (latitude !== undefined && longitude !== undefined) {
      const parsed = parseCoordinatePair(latitude, longitude);
      lat = parsed.latitude;
      lng = parsed.longitude;
    }
    else {
      return res.status(400).json({ 
        error: 'Please provide either "coordinates" (Google Maps format) or "latitude" and "longitude" fields',
        examples: {
          googleMaps: { coordinates: "12.903016468272682, 77.60606960542954" },
          decimal: { latitude: 12.903016, longitude: 77.606069 },
          dms: { latitude: "12°54'10.3\"N", longitude: "77°36'22.3\"E" }
        }
      });
    }
    
    // Validate coordinates
    validateCoordinates(lat, lng);
    
    const code = getDigiPin(lat, lng);
    res.json({ 
      digipin: code,
      input: { latitude: lat, longitude: lng }
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/decode', (req, res) => { const { digipin } = req.body; try { const coords = getLatLngFromDigiPin(digipin); res.json(coords); } catch (e) { res.status(400).json({ error: e.message }); } });

  router.get('/encode', (req, res) => {
  const { latitude, longitude, coordinates } = req.query;
  
  try {
    let lat, lng;
    
    // Handle Google Maps coordinate string format
    if (coordinates && typeof coordinates === 'string') {
      const parsed = parseGoogleMapsCoords(coordinates);
      lat = parsed.latitude;
      lng = parsed.longitude;
    }
    // Handle individual latitude/longitude (supports DMS and decimal)
    else if (latitude !== undefined && longitude !== undefined) {
      const parsed = parseCoordinatePair(latitude, longitude);
      lat = parsed.latitude;
      lng = parsed.longitude;
    }
    else {
      return res.status(400).json({ 
        error: 'Please provide either "coordinates" (Google Maps format) or "latitude" and "longitude" query parameters',
        examples: {
          googleMaps: '/encode?coordinates=12.903016468272682,77.60606960542954',
          decimal: '/encode?latitude=12.903016&longitude=77.606069',
          dms: '/encode?latitude=12°54\'10.3"N&longitude=77°36\'22.3"E'
        }
      });
    }
    
    // Validate coordinates
    validateCoordinates(lat, lng);
    
    const code = getDigiPin(lat, lng);
    res.json({ 
      digipin: code,
      input: { latitude: lat, longitude: lng }
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
  
  router.get('/decode', (req, res) => {
    const { digipin } = req.query;
    try {
      const coords = getLatLngFromDigiPin(digipin);
      res.json(coords);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  
module.exports = router;
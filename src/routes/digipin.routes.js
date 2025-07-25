const express = require("express");
const router = express.Router();
const {
  getDigiPin,
  getLatLngFromDigiPin,
  parseDMSString,
  parseLatLongString
} = require("../digipin");

router.post("/encode", (req, res) => {
  // const { latitude, longitude } = req.body;
  try {
    let latitude, longitude;

    if(req.body.lat_long){
      const coords = parseLatLongString(req.body.lat_long);
      latitude = coords.latitude;
      longitude = coords.longitude;
    }
    // Check if coordinates field is provided (DMS format)
    else if (req.body.coordinates) {
      const coords = parseDMSString(req.body.coordinates);
      latitude = coords.latitude;
      longitude = coords.longitude;
    } else if (
      req.body.latitude !== undefined &&
      req.body.longitude !== undefined
    ) {
      // Traditional decimal format
      latitude = req.body.latitude;
      longitude = req.body.longitude;
    } else {
      return res.status(400).json({
        error:
          "Provide any one of latitude & longitude parameters, coordinates parameter in DMS format, or lat_long parameter in lat,long format",
      });
    }
    const code = getDigiPin(latitude, longitude);
    res.json({ digipin: code });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/decode", (req, res) => {
  const { digipin } = req.body;
  try {
    const coords = getLatLngFromDigiPin(digipin);
    res.json(coords);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/encode", (req, res) => {
  // const { latitude, longitude } = req.query;
  try {
    let latitude, longitude;
    if(req.query.lat_long){
      const coords = parseLatLongString(req.query.lat_long);
      latitude = coords.latitude;
      longitude = coords.longitude;
    }
    // Check if coordinates parameter is provided (DMS format)
    else if (req.query.coordinates) {
      const coords = parseDMSString(req.query.coordinates);
      latitude = coords.latitude;
      longitude = coords.longitude;
    } else if (req.query.latitude && req.query.longitude) {
      // Traditional decimal format
      latitude = parseFloat(req.query.latitude);
      longitude = parseFloat(req.query.longitude);
    } else {
      return res.status(400).json({
        error:
          "Provide any one of latitude & longitude parameters, coordinates parameter in DMS format, or lat_long parameter in lat,long format",
      });
    }

    const code = getDigiPin(latitude, longitude);
    res.json({ digipin: code });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/decode", (req, res) => {
  const { digipin } = req.query;
  try {
    const coords = getLatLngFromDigiPin(digipin);
    res.json(coords);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;

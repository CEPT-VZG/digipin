const express = require('express');
const router = express.Router();
const { getDigiPin, getLatLngFromDigiPin } = require('../digipin');

router.post('/encode', (req, res) => { const { latitude, longitude, countryCode } = req.body; try { const code = getDigiPin(latitude, longitude, countryCode); res.json({ digipin: code }); } catch (e) { res.status(400).json({ error: e.message }); } });

router.post('/decode', (req, res) => { const { digipin, countryCode } = req.body; try { const coords = getLatLngFromDigiPin(digipin, countryCode); res.json(coords); } catch (e) { res.status(400).json({ error: e.message }); } });

router.get('/encode', (req, res) => {
  const { latitude, longitude, countryCode } = req.query;
  try {
    const code = getDigiPin(parseFloat(latitude), parseFloat(longitude), countryCode );
    res.json({ digipin: code });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
  
router.get('/decode', (req, res) => {
  const { digipin, countryCode } = req.query;
  try {
    const coords = getLatLngFromDigiPin(digipin, countryCode);
    res.json(coords);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

  
module.exports = router;
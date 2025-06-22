const express = require('express');
const router = express.Router();
const { 
  encode, 
  decode, 
  calculateDigipinDistance,
  getNeighbors,
  batchEncodeSync,
  batchDecodeSync,
  validateDigipinFormat 
} = require('../../dist/index.js');

// Legacy routes for backwards compatibility
router.post('/encode', (req, res) => {
  const { latitude, longitude } = req.body;
  try {
    const code = encode(parseFloat(latitude), parseFloat(longitude));
    res.json({ digipin: code });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/decode', (req, res) => {
  const { digipin } = req.body;
  try {
    const coords = decode(digipin);
    res.json(coords);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/encode', (req, res) => {
  const { latitude, longitude } = req.query;
  try {
    const code = encode(parseFloat(latitude), parseFloat(longitude));
    res.json({ digipin: code });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/decode', (req, res) => {
  const { digipin } = req.query;
  try {
    const coords = decode(digipin);
    res.json(coords);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// New advanced routes
router.get('/validate', (req, res) => {
  const { digipin } = req.query;
  try {
    const validation = validateDigipinFormat(digipin);
    res.json(validation);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/distance', (req, res) => {
  const { from, to } = req.query;
  try {
    const distance = calculateDigipinDistance(from, to);
    res.json(distance);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/neighbors', (req, res) => {
  const { digipin, includeDiagonals = 'true' } = req.query;
  try {
    const neighbors = getNeighbors(digipin, {
      includeDiagonals: includeDiagonals === 'true'
    });
    res.json({ neighbors });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/batch/encode', (req, res) => {
  const { coordinates } = req.body;
  try {
    if (!Array.isArray(coordinates)) {
      return res.status(400).json({ error: 'coordinates must be an array' });
    }
    const result = batchEncodeSync(coordinates);
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/batch/decode', (req, res) => {
  const { digipins } = req.body;
  try {
    if (!Array.isArray(digipins)) {
      return res.status(400).json({ error: 'digipins must be an array' });
    }
    const result = batchDecodeSync(digipins);
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
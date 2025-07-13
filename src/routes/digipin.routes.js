const express = require("express");
const router = express.Router();
const { getDigiPin, getLatLngFromDigiPin } = require("../digipin");

const MAX_BATCH_SIZE = 100;

router.post("/encode", (req, res) => {
  const { latitude, longitude } = req.body;
  try {
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
  const { latitude, longitude } = req.query;
  try {
    const code = getDigiPin(parseFloat(latitude), parseFloat(longitude));
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

// POST /encode/batch
router.post("/encode/batch", (req, res) => {
  const { coords } = req.body;

  if (!Array.isArray(coords)) {
    return res.status(400).json({ error: "coords must be an array" });
  }

  if (coords.length > MAX_BATCH_SIZE) {
    return res
      .status(413)
      .json({ error: `Max ${MAX_BATCH_SIZE} coordinates allowed` });
  }

  const results = coords.map(({ latitude, longitude }) => {
    try {
      const digipin = getDigiPin(latitude, longitude);
      return { latitude, longitude, digipin };
    } catch (e) {
      return { latitude, longitude, error: e.message };
    }
  });

  res.json({ results });
});

// POST /decode/batch
router.post("/decode/batch", (req, res) => {
  const { digipins } = req.body;

  if (!Array.isArray(digipins)) {
    return res.status(400).json({ error: "digipins must be an array" });
  }

  if (digipins.length > MAX_BATCH_SIZE) {
    return res
      .status(413)
      .json({ error: `Max ${MAX_BATCH_SIZE} digipins allowed` });
  }

  const results = digipins.map((digipin) => {
    try {
      const { latitude, longitude } = getLatLngFromDigiPin(digipin);
      return { digipin, latitude, longitude };
    } catch (e) {
      return { digipin, error: e.message };
    }
  });

  res.json({ results });
});

module.exports = router;

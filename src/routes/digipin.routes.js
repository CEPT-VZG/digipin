const express = require('express');
const { body, query, validationResult } = require('express-validator');
const router = express.Router();
const { getDigiPin, getLatLngFromDigiPin } = require('../digipin');

// Input validation middleware
const validateCoordinates = [
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90')
    .customSanitizer(value => {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? null : parsed;
    }),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180')
    .customSanitizer(value => {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? null : parsed;
    }),
];

const validateCoordinatesQuery = [
  query('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90')
    .customSanitizer(value => {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? null : parsed;
    }),
  query('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180')
    .customSanitizer(value => {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? null : parsed;
    }),
];

const validateDigipin = [
  body('digipin')
    .isString()
    .trim()
    .isLength({ min: 12, max: 12 })
    .withMessage('DIGIPIN must be exactly 12 characters (including hyphens)')
    .matches(/^[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{4}$/)
    .withMessage('Invalid DIGIPIN format. Expected format: XXX-XXX-XXXX where X is 2-9, C, F, J, K, L, M, P, or T')
    .customSanitizer(value => value.toUpperCase()),
];

const validateDigipinQuery = [
  query('digipin')
    .isString()
    .trim()
    .isLength({ min: 12, max: 12 })
    .withMessage('DIGIPIN must be exactly 12 characters (including hyphens)')
    .matches(/^[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{4}$/)
    .withMessage('Invalid DIGIPIN format. Expected format: XXX-XXX-XXXX where X is 2-9, C, F, J, K, L, M, P, or T')
    .customSanitizer(value => value.toUpperCase()),
];

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Sanitize and process coordinates with additional validation
const sanitizeCoordinates = (lat, lng) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  
  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Invalid coordinate values - must be valid numbers');
  }
  
  // Additional bounds checking for India-specific DIGIPIN system
  if (latitude < 2.5 || latitude > 38.5) {
    throw new Error('Latitude must be between 2.5 and 38.5 for DIGIPIN encoding');
  }
  
  if (longitude < 63.5 || longitude > 99.5) {
    throw new Error('Longitude must be between 63.5 and 99.5 for DIGIPIN encoding');
  }
  
  return { latitude, longitude };
};

// Sanitize DIGIPIN input
const sanitizeDigipin = (digipin) => {
  if (!digipin || typeof digipin !== 'string') {
    throw new Error('DIGIPIN must be a valid string');
  }
  
  const sanitized = digipin.trim().toUpperCase();
  
  // Validate format
  if (!/^[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{4}$/.test(sanitized)) {
    throw new Error('Invalid DIGIPIN format. Expected format: XXX-XXX-XXXX where X is 2-9, C, F, J, K, L, M, P, or T');
  }
  
  return sanitized;
};

// Routes with comprehensive validation
router.post('/encode', validateCoordinates, handleValidationErrors, (req, res) => {
  try {
    const { latitude, longitude } = sanitizeCoordinates(req.body.latitude, req.body.longitude);
    const code = getDigiPin(latitude, longitude);
    res.json({ 
      digipin: code,
      coordinates: { latitude, longitude }
    });
  } catch (e) {
    res.status(400).json({ 
      error: 'Encoding failed',
      message: e.message 
    });
  }
});

router.post('/decode', validateDigipin, handleValidationErrors, (req, res) => {
  try {
    const digipin = sanitizeDigipin(req.body.digipin);
    const coords = getLatLngFromDigiPin(digipin);
    res.json({
      digipin: digipin,
      coordinates: coords
    });
  } catch (e) {
    res.status(400).json({ 
      error: 'Decoding failed',
      message: e.message 
    });
  }
});

router.get('/encode', validateCoordinatesQuery, handleValidationErrors, (req, res) => {
  try {
    const { latitude, longitude } = sanitizeCoordinates(req.query.latitude, req.query.longitude);
    const code = getDigiPin(latitude, longitude);
    res.json({ 
      digipin: code,
      coordinates: { latitude, longitude }
    });
  } catch (e) {
    res.status(400).json({ 
      error: 'Encoding failed',
      message: e.message 
    });
  }
});

router.get('/decode', validateDigipinQuery, handleValidationErrors, (req, res) => {
  try {
    const digipin = sanitizeDigipin(req.query.digipin);
    const coords = getLatLngFromDigiPin(digipin);
    res.json({
      digipin: digipin,
      coordinates: coords
    });
  } catch (e) {
    res.status(400).json({ 
      error: 'Decoding failed',
      message: e.message 
    });
  }
});

module.exports = router;
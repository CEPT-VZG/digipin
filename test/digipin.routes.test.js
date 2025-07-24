const request = require('supertest');
const app = require('../src/app');

describe('DIGIPIN Routes', () => {
  describe('GET /api/digipin/encode', () => {
    it('should encode valid coordinates to DIGIPIN', async () => {
      const response = await request(app)
        .get('/api/digipin/encode')
        .query({
          latitude: 12.9716,
          longitude: 77.5946
        })
        .expect(200);

      expect(response.body).toHaveProperty('digipin');
      expect(typeof response.body.digipin).toBe('string');
      expect(response.body.digipin).toMatch(/^[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{4}$/);
    });

    it('should handle string coordinates and convert to numbers', async () => {
      const response = await request(app)
        .get('/api/digipin/encode')
        .query({
          latitude: '12.9716',
          longitude: '77.5946'
        })
        .expect(200);

      expect(response.body).toHaveProperty('digipin');
      expect(typeof response.body.digipin).toBe('string');
    });

    it('should return 400 for invalid latitude (out of range)', async () => {
      const response = await request(app)
        .get('/api/digipin/encode')
        .query({
          latitude: 1.0, // Below minimum (2.5)
          longitude: 77.5946
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Latitude out of range');
    });

    it('should return 400 for invalid longitude (out of range)', async () => {
      const response = await request(app)
        .get('/api/digipin/encode')
        .query({
          latitude: 12.9716,
          longitude: 60.0 // Below minimum (63.5)
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Longitude out of range');
    });
  });

  describe('POST /api/digipin/encode', () => {
    it('should encode valid coordinates to DIGIPIN', async () => {
      const response = await request(app)
        .post('/api/digipin/encode')
        .send({
          latitude: 12.9716,
          longitude: 77.5946
        })
        .expect(200);

      expect(response.body).toHaveProperty('digipin');
      expect(typeof response.body.digipin).toBe('string');
      expect(response.body.digipin).toMatch(/^[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{4}$/);
    });

    it('should return 400 for invalid latitude (out of range)', async () => {
      const response = await request(app)
        .post('/api/digipin/encode')
        .send({
          latitude: 1.0, // Below minimum (2.5)
          longitude: 77.5946
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Latitude out of range');
    });

    it('should return 400 for invalid longitude (out of range)', async () => {
      const response = await request(app)
        .post('/api/digipin/encode')
        .send({
          latitude: 12.9716,
          longitude: 60.0 // Below minimum (63.5)
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Longitude out of range');
    });
  });

  describe('GET /api/digipin/decode', () => {
    it('should decode valid DIGIPIN to coordinates', async () => {
      const response = await request(app)
        .get('/api/digipin/decode')
        .query({
          digipin: '4P3-JK8-52C9'
        })
        .expect(200);

      expect(response.body).toHaveProperty('latitude');
      expect(response.body).toHaveProperty('longitude');
      expect(typeof response.body.latitude).toBe('string');
      expect(typeof response.body.longitude).toBe('string');
      expect(parseFloat(response.body.latitude)).toBeGreaterThan(0);
      expect(parseFloat(response.body.longitude)).toBeGreaterThan(0);
    });

    it('should return 400 for invalid DIGIPIN format (too short)', async () => {
      const response = await request(app)
        .get('/api/digipin/decode')
        .query({
          digipin: '4P3-JK8'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid DIGIPIN');
    });

    it('should return 400 for DIGIPIN with invalid characters', async () => {
      const response = await request(app)
        .get('/api/digipin/decode')
        .query({
          digipin: '4P3-JK8-52C#'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid character in DIGIPIN');
    });

    it('should handle DIGIPIN without hyphens', async () => {
      const response = await request(app)
        .get('/api/digipin/decode')
        .query({
          digipin: '4P3JK852C9'
        })
        .expect(200);

      expect(response.body).toHaveProperty('latitude');
      expect(response.body).toHaveProperty('longitude');
    });
  });

  describe('POST /api/digipin/decode', () => {
    it('should decode valid DIGIPIN to coordinates', async () => {
      const response = await request(app)
        .post('/api/digipin/decode')
        .send({
          digipin: '4P3-JK8-52C9'
        })
        .expect(200);

      expect(response.body).toHaveProperty('latitude');
      expect(response.body).toHaveProperty('longitude');
      expect(typeof response.body.latitude).toBe('string');
      expect(typeof response.body.longitude).toBe('string');
      expect(parseFloat(response.body.latitude)).toBeGreaterThan(0);
      expect(parseFloat(response.body.longitude)).toBeGreaterThan(0);
    });

    it('should return 400 for invalid DIGIPIN format (too short)', async () => {
      const response = await request(app)
        .post('/api/digipin/decode')
        .send({
          digipin: '4P3-JK8'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid DIGIPIN');
    });

    it('should return 400 for DIGIPIN with invalid characters', async () => {
      const response = await request(app)
        .post('/api/digipin/decode')
        .send({
          digipin: '4P3-JK8-52C#'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid character in DIGIPIN');
    });

    it('should handle DIGIPIN without hyphens', async () => {
      const response = await request(app)
        .post('/api/digipin/decode')
        .send({
          digipin: '4P3JK852C9'
        })
        .expect(200);

      expect(response.body).toHaveProperty('latitude');
      expect(response.body).toHaveProperty('longitude');
    });
  });

  describe('Round-trip encoding and decoding', () => {
    it('should encode and decode coordinates correctly', async () => {
      const originalLat = 12.9716;
      const originalLon = 77.5946;

      // Encode
      const encodeResponse = await request(app)
        .get('/api/digipin/encode')
        .query({
          latitude: originalLat,
          longitude: originalLon
        })
        .expect(200);

      const digipin = encodeResponse.body.digipin;

      // Decode
      const decodeResponse = await request(app)
        .get('/api/digipin/decode')
        .query({
          digipin: digipin
        })
        .expect(200);

      const decodedLat = parseFloat(decodeResponse.body.latitude);
      const decodedLon = parseFloat(decodeResponse.body.longitude);

      // Check that decoded coordinates are close to original (within reasonable tolerance)
      expect(Math.abs(decodedLat - originalLat)).toBeLessThan(0.001);
      expect(Math.abs(decodedLon - originalLon)).toBeLessThan(0.001);
    });
  });
});

/**
 * Integration Tests for API Endpoints
 */
const request = require('supertest');
const { app } = require('../../server'); // Use existing server to avoid redefining app.js

describe('API Integration Tests', () => {
  
  describe('GET /', () => {
    it('should return 200 status', async () => {
      const response = await request(app).get('/');
      expect(response.statusCode).toBe(200);
    });

    it('should return success message', async () => {
      const response = await request(app).get('/');
      expect(response.text).toContain('Running');
    });
  });

  describe('404 Error Handling', () => {
    it('should return 404 for non-existent route', async () => {
      const response = await request(app).get('/api/nonexistent');
      expect(response.statusCode).toBe(404);
    });
  });
});

const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server'); 
const User = require('../models/User');

describe('Authentication API', () => {
  
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/smartcart-test');
  });
  
  afterAll(async () => {
    // Cleanup
    await User.deleteMany({});
    await mongoose.connection.close();
  });
  
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('email', 'test@example.com');
    });
    
    it('should not register user with existing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User 2',
          email: 'test@example.com', // Same email
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });
  
  describe('POST /api/auth/login', () => {
    it('should login existing user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
    
    it('should not login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });
      
      expect(res.statusCode).toBe(401);
    });
  });
});

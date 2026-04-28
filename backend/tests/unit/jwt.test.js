/**
 * Unit Tests for JWT Token Generation
 */
const jwt = require('jsonwebtoken');

describe('JWT Token Generation', () => {
  const JWT_SECRET = 'test-secret-key-for-testing-purposes';
  
  describe('Token Creation', () => {
    it('should generate a valid JWT token', () => {
      const payload = {
        userId: '12345',
        email: 'test@example.com'
      };
      
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include user data in token', () => {
      const payload = {
        userId: '12345',
        email: 'test@example.com'
      };
      
      const token = jwt.sign(payload, JWT_SECRET);
      const decoded = jwt.verify(token, JWT_SECRET);
      
      expect(decoded.userId).toBe('12345');
      expect(decoded.email).toBe('test@example.com');
    });

    it('should set expiration time', () => {
      const payload = { userId: '12345' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
      const decoded = jwt.verify(token, JWT_SECRET);
      
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });

  describe('Token Verification', () => {
    it('should verify valid token', () => {
      const payload = { userId: '12345' };
      const token = jwt.sign(payload, JWT_SECRET);
      
      const decoded = jwt.verify(token, JWT_SECRET);
      
      expect(decoded.userId).toBe('12345');
    });

    it('should reject invalid token', () => {
      const invalidToken = 'invalid.token.string';
      
      expect(() => {
        jwt.verify(invalidToken, JWT_SECRET);
      }).toThrow();
    });

    it('should reject token with wrong secret', () => {
      const payload = { userId: '12345' };
      const token = jwt.sign(payload, 'secret1');
      
      expect(() => {
        jwt.verify(token, 'secret2');
      }).toThrow();
    });

    it('should reject expired token', () => {
      const payload = { userId: '12345' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1ms' });
      
      // Wait for token to expire
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(() => {
            jwt.verify(token, JWT_SECRET);
          }).toThrow('jwt expired');
          resolve();
        }, 10);
      });
    });
  });
});

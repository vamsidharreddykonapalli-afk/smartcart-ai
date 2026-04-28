const bcrypt = require('bcryptjs');

describe('Password Hashing with Bcrypt', () => {
  
  describe('Hash Generation', () => {
    it('should hash a password', async () => {
      const password = 'password123';
      const hashed = await bcrypt.hash(password, 10);
      
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(password.length);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'password123';
      const hash1 = await bcrypt.hash(password, 10);
      const hash2 = await bcrypt.hash(password, 10);
      
      expect(hash1).not.toBe(hash2); // Different salts
    });
  });

  describe('Password Comparison', () => {
    it('should return true for correct password', async () => {
      const password = 'password123';
      const hashed = await bcrypt.hash(password, 10);
      
      const isMatch = await bcrypt.compare(password, hashed);
      
      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'password123';
      const hashed = await bcrypt.hash(password, 10);
      
      const isMatch = await bcrypt.compare('wrongpassword', hashed);
      
      expect(isMatch).toBe(false);
    });
  });

  describe('Security', () => {
    it('should take time to hash (brute-force protection)', async () => {
      const start = Date.now();
      await bcrypt.hash('password123', 10);
      const duration = Date.now() - start;
      
      // Should take at least 50ms (security feature)
      expect(duration).toBeGreaterThan(50);
    });
  });
});

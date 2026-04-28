/**
 * Unit Tests for Price Prediction Algorithm
 * Tests linear regression logic
 */

describe('Price Prediction - Linear Regression', () => {
  
  /**
   * Linear Regression Implementation (for testing)
   */
  function linearRegression(yValues) {
    const n = yValues.length;
    const xValues = Array.from({ length: n }, (_, i) => i);
    
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
  }

  describe('Slope Calculation', () => {
    it('should calculate positive slope for increasing prices', () => {
      const prices = [50, 52, 54, 56, 58]; // Increasing by 2
      const { slope } = linearRegression(prices);
      
      expect(slope).toBeGreaterThan(0);
      expect(slope).toBeCloseTo(2, 0);
    });

    it('should calculate negative slope for decreasing prices', () => {
      const prices = [60, 58, 56, 54, 52]; // Decreasing by 2
      const { slope } = linearRegression(prices);
      
      expect(slope).toBeLessThan(0);
      expect(slope).toBeCloseTo(-2, 0);
    });

    it('should calculate zero slope for stable prices', () => {
      const prices = [50, 50, 50, 50, 50]; // Constant
      const { slope } = linearRegression(prices);
      
      expect(slope).toBeCloseTo(0, 5);
    });
  });

  describe('Intercept Calculation', () => {
    it('should calculate correct intercept', () => {
      const prices = [50, 52, 54, 56, 58];
      const { intercept } = linearRegression(prices);
      
      expect(intercept).toBeCloseTo(50, 0);
    });
  });

  describe('Price Prediction', () => {
    it('should predict next day price for upward trend', () => {
      const prices = [50, 52, 54, 56, 58]; // Day 0-4
      const { slope, intercept } = linearRegression(prices);
      
      // Predict day 5
      const predictedDay5 = slope * 5 + intercept;
      
      expect(predictedDay5).toBeCloseTo(60, 0);
    });

    it('should predict next day price for downward trend', () => {
      const prices = [60, 58, 56, 54, 52]; // Day 0-4
      const { slope, intercept } = linearRegression(prices);
      
      // Predict day 5
      const predictedDay5 = slope * 5 + intercept;
      
      expect(predictedDay5).toBeCloseTo(50, 0);
    });

    it('should predict stable price for constant trend', () => {
      const prices = [50, 50, 50, 50, 50];
      const { slope, intercept } = linearRegression(prices);
      
      const predictedDay5 = slope * 5 + intercept;
      
      expect(predictedDay5).toBeCloseTo(50, 0);
    });
  });

  describe('Confidence Calculation (R-squared)', () => {
    it('should return high confidence for perfect linear trend', () => {
      const prices = [50, 52, 54, 56, 58]; // Perfect linear
      const { slope, intercept } = linearRegression(prices);
      
      const yMean = prices.reduce((a, b) => a + b) / prices.length;
      
      // Calculate R-squared
      const sst = prices.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
      const ssr = prices.reduce((sum, y, i) => {
        const yPred = slope * i + intercept;
        return sum + Math.pow(y - yPred, 2);
      }, 0);
      
      const rSquared = 1 - (ssr / sst);
      
      expect(rSquared).toBeGreaterThan(0.99);
    });

    it('should return low confidence for random data', () => {
      const prices = [50, 55, 49, 60, 45]; // Random
      const { slope, intercept } = linearRegression(prices);
      
      const yMean = prices.reduce((a, b) => a + b) / prices.length;
      const sst = prices.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
      const ssr = prices.reduce((sum, y, i) => {
        const yPred = slope * i + intercept;
        return sum + Math.pow(y - yPred, 2);
      }, 0);
      
      const rSquared = 1 - (ssr / sst);
      
      expect(rSquared).toBeLessThan(0.5);
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum data points', () => {
      const prices = [50, 52]; // Only 2 points
      const { slope, intercept } = linearRegression(prices);
      
      expect(slope).toBeDefined();
      expect(intercept).toBeDefined();
    });

    it('should handle volatile vegetable prices', () => {
      const prices = [40, 38, 42, 37, 43]; // High volatility
      const { slope } = linearRegression(prices);
      
      // Slope should still be calculated
      expect(typeof slope).toBe('number');
      expect(isNaN(slope)).toBe(false);
    });
  });
});

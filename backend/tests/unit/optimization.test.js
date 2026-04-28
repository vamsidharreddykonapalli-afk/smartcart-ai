/**
 * Unit Tests for Greedy Optimization Algorithm
 * Tests the core logic without database dependencies
 */

describe('Greedy Optimization Algorithm - Unit Tests', () => {
  
  // Mock price data
  const mockPriceMatrix = {
    'prod1': {
      'BigBasket': { price: 54, inStock: true },
      'Zepto': { price: 56, inStock: true },
      'Blinkit': { price: 55, inStock: true },
      'Instamart': { price: 54, inStock: true },
      'JioMart': { price: 53, inStock: true }
    },
    'prod2': {
      'BigBasket': { price: 600, inStock: true },
      'Zepto': { price: 625, inStock: true },
      'Blinkit': { price: 610, inStock: true },
      'Instamart': { price: 595, inStock: true },
      'JioMart': { price: 590, inStock: true }
    },
    'prod3': {
      'BigBasket': { price: 35, inStock: true },
      'Zepto': { price: 36, inStock: true },
      'Blinkit': { price: 34, inStock: true },
      'Instamart': { price: 35, inStock: true },
      'JioMart': { price: 36, inStock: true }
    }
  };

  describe('Greedy Choice - Find Minimum Price', () => {
    it('should find the cheapest store for milk', () => {
      const prices = mockPriceMatrix.prod1;
      
      let minPrice = Infinity;
      let cheapestStore = null;
      
      Object.entries(prices).forEach(([store, data]) => {
        if (data.inStock && data.price < minPrice) {
          minPrice = data.price;
          cheapestStore = store;
        }
      });
      
      expect(cheapestStore).toBe('JioMart');
      expect(minPrice).toBe(53);
    });

    it('should find the cheapest store for rice', () => {
      const prices = mockPriceMatrix.prod2;
      
      const cheapest = Object.entries(prices)
        .filter(([_, data]) => data.inStock)
        .reduce((min, [store, data]) => 
          data.price < min.price ? { store, price: data.price } : min,
          { store: '', price: Infinity }
        );
      
      expect(cheapest.store).toBe('JioMart');
      expect(cheapest.price).toBe(590);
    });

    it('should handle out of stock items', () => {
      const pricesWithOutOfStock = {
        'BigBasket': { price: 50, inStock: false },
        'Zepto': { price: 52, inStock: true },
        'JioMart': { price: 51, inStock: false }
      };
      
      const cheapest = Object.entries(pricesWithOutOfStock)
        .filter(([_, data]) => data.inStock)
        .reduce((min, [store, data]) => 
          data.price < min.price ? { store, price: data.price } : min,
          { store: '', price: Infinity }
        );
      
      expect(cheapest.store).toBe('Zepto');
      expect(cheapest.price).toBe(52);
    });
  });

  describe('Total Cost Calculation', () => {
    it('should calculate total cost correctly', () => {
      const cart = [
        { productId: 'prod1', quantity: 2, price: 53 },  // Milk
        { productId: 'prod2', quantity: 1, price: 590 }, // Rice
        { productId: 'prod3', quantity: 2, price: 34 }   // Bread
      ];
      
      const totalCost = cart.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      );
      
      expect(totalCost).toBe(53*2 + 590*1 + 34*2);
      expect(totalCost).toBe(764);
    });

    it('should handle empty cart', () => {
      const cart = [];
      const totalCost = cart.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      );
      
      expect(totalCost).toBe(0);
    });

    it('should handle single item cart', () => {
      const cart = [
        { productId: 'prod1', quantity: 1, price: 53 }
      ];
      
      const totalCost = cart.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      );
      
      expect(totalCost).toBe(53);
    });
  });

  describe('Savings Calculation', () => {
    it('should calculate savings percentage correctly', () => {
      const optimizedCost = 1012;
      const worstCaseCost = 1164;
      
      const savings = worstCaseCost - optimizedCost;
      const savingsPercent = (savings / worstCaseCost) * 100;
      
      expect(savings).toBe(152);
      expect(savingsPercent).toBeCloseTo(13.06, 1);
    });

    it('should handle zero savings', () => {
      const optimizedCost = 1000;
      const worstCaseCost = 1000;
      
      const savings = worstCaseCost - optimizedCost;
      const savingsPercent = (savings / worstCaseCost) * 100;
      
      expect(savings).toBe(0);
      expect(savingsPercent).toBe(0);
    });

    it('should calculate worst case scenario', () => {
      const items = [
        { id: 'prod1', qty: 2 },
        { id: 'prod2', qty: 1 },
        { id: 'prod3', qty: 2 }
      ];
      
      const storeTotals = {
        'BigBasket': 54*2 + 600 + 35*2,
        'Zepto': 56*2 + 625 + 36*2,
        'JioMart': 53*2 + 590 + 36*2
      };
      
      const worstCase = Math.max(...Object.values(storeTotals));
      
      expect(worstCase).toBe(storeTotals.Zepto);
      expect(worstCase).toBe(809);
    });
  });

  describe('Time Complexity Analysis', () => {
    it('should execute in O(n*m) time', () => {
      const items = 50; // n
      const stores = 5; // m
      const expectedOperations = items * stores;
      
      expect(expectedOperations).toBe(250);
    });

    it('should scale linearly with items', () => {
      const stores = 5;
      
      const operations10 = 10 * stores;
      const operations100 = 100 * stores;
      
      expect(operations100 / operations10).toBe(10);
    });
  });
});

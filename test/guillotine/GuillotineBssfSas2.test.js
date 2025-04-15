const { GuillotineBssfSas, Rectangle } = require('../../src/rectpack/guillotine');

describe('GuillotineBssfSas', () => {
  let packer;

  beforeEach(() => {
    // Initialize a new packer before each test with a 100x200 container
    packer = new GuillotineBssfSas(100, 200);
  });

  describe('initialization', () => {
    it('should initialize with correct dimensions', () => {
      expect(packer.width).toBe(100);
      expect(packer.height).toBe(200);
    });

    it('should start with an empty rectangles list', () => {
      expect(packer.rectangles).toHaveLength(0);
    });
  });

  describe('addRect', () => {
    it('should add a rectangle successfully', () => {
      const rect = packer.addRect(50, 30);
      expect(rect).toBeTruthy();
      expect(rect.width).toBe(50);
      expect(rect.height).toBe(30);
      expect(rect.x).toBe(0);
      expect(rect.y).toBe(0);
    });

    it('should return null when rectangle does not fit', () => {
      const rect = packer.addRect(150, 150);
      expect(rect).toBeNull();
    });

    it('should handle multiple rectangles', () => {
      const rect1 = packer.addRect(50, 50);
      const rect2 = packer.addRect(50, 50);
      
      expect(rect1).toBeTruthy();
      expect(rect2).toBeTruthy();
      expect(rect1.intersects(rect2)).toBeFalsy();
    });

    it('should throw error for invalid dimensions', () => {
      expect(() => packer.addRect(0, 50)).toThrow();
      expect(() => packer.addRect(50, 0)).toThrow();
      expect(() => packer.addRect(-10, 50)).toThrow();
    });
  });

  describe('BSSF (Best Short Side Fit) strategy', () => {
    it('should choose section with minimum short side difference', () => {
      // Add a rectangle that will create two sections
      const rect1 = packer.addRect(60, 40);
      expect(rect1).toBeTruthy();
      
      // The next rectangle should be placed in the section with the best short side fit
      const rect2 = packer.addRect(30, 30);
      expect(rect2).toBeTruthy();
      
      // Based on BSSF, it should prefer the section with smaller waste on the shorter side
      expect(rect2.x).toBe(60);
      expect(rect2.y).toBe(0);
    });
  });

  describe('SAS (Shorter Axis Split) strategy', () => {
    it('should split along shorter axis', () => {
      // Add a rectangle that will trigger a split
      const rect = packer.addRect(60, 40);
      expect(rect).toBeTruthy();
      
      // The split should create two new sections:
      // 1. A section to the right (width: 40, height: 40)
      // 2. A section below (width: 100, height: 160)
      
      // Test that we can place rectangles in both sections
      const rectRight = packer.addRect(35, 35);
      expect(rectRight).toBeTruthy();
      expect(rectRight.x).toBe(60);
      
      const rectBottom = packer.addRect(90, 150);
      expect(rectBottom).toBeTruthy();
      expect(rectBottom.y).toBe(40);
    });
  });

  describe('reset', () => {
    it('should clear all placed rectangles', () => {
      packer.addRect(50, 50);
      packer.addRect(30, 30);
      expect(packer.rectangles).toHaveLength(2);
      
      packer.reset();
      expect(packer.rectangles).toHaveLength(0);
    });

    it('should restore initial container state', () => {
      packer.addRect(50, 50);
      packer.reset();
      
      // Should be able to add a rectangle using full container dimensions
      const rect = packer.addRect(100, 200);
      expect(rect).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle exact fit rectangles', () => {
      const rect = packer.addRect(100, 200);
      expect(rect).toBeTruthy();
      expect(rect.width).toBe(100);
      expect(rect.height).toBe(200);
    });

    it('should handle rectangles with one maximum dimension', () => {
      const rect = packer.addRect(100, 100);
      expect(rect).toBeTruthy();
      expect(rect.width).toBe(100);
      expect(rect.height).toBe(100);
    });

    it('should handle multiple small rectangles efficiently', () => {
      const smallRects = [];
      for (let i = 0; i < 10; i++) {
        const rect = packer.addRect(20, 20);
        expect(rect).toBeTruthy();
        smallRects.push(rect);
      }

      // Verify no overlaps
      for (let i = 0; i < smallRects.length; i++) {
        for (let j = i + 1; j < smallRects.length; j++) {
          expect(smallRects[i].intersects(smallRects[j])).toBeFalsy();
        }
      }
    });
  });
});

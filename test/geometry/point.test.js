const { Point } = require('../../src/rectpack/geometry');

describe('Point', () => {
    // Test constructor
    describe('constructor', () => {
        test('should create a point with given x and y coordinates', () => {
            const point = new Point(2, 3);
            expect(point.x).toBe(2);
            expect(point.y).toBe(3);
        });

        test('should handle negative coordinates', () => {
            const point = new Point(-1, -5);
            expect(point.x).toBe(-1);
            expect(point.y).toBe(-5);
        });

        test('should handle zero coordinates', () => {
            const point = new Point(0, 0);
            expect(point.x).toBe(0);
            expect(point.y).toBe(0);
        });

        test('should handle floating point coordinates', () => {
            const point = new Point(1.5, 2.7);
            expect(point.x).toBe(1.5);
            expect(point.y).toBe(2.7);
        });
    });

    // Test equals method
    describe('equals', () => {
        test('should return true for points with same coordinates', () => {
            const point1 = new Point(2, 3);
            const point2 = new Point(2, 3);
            expect(point1.equals(point2)).toBe(true);
        });

        test('should return false for points with different coordinates', () => {
            const point1 = new Point(2, 3);
            const point2 = new Point(3, 2);
            expect(point1.equals(point2)).toBe(false);
        });

        test('should handle comparison with same point instance', () => {
            const point = new Point(2, 3);
            expect(point.equals(point)).toBe(true);
        });
    });

    // Test toString method
    describe('toString', () => {
        test('should return correct string representation', () => {
            const point = new Point(2, 3);
            expect(point.toString()).toBe('P(2, 3)');
        });

        test('should handle negative coordinates in string representation', () => {
            const point = new Point(-1, -5);
            expect(point.toString()).toBe('P(-1, -5)');
        });

        test('should handle floating point coordinates in string representation', () => {
            const point = new Point(1.5, 2.7);
            expect(point.toString()).toBe('P(1.5, 2.7)');
        });
    });

    // Test distance method
    describe('distance', () => {
        test('should calculate correct distance between two points', () => {
            const point1 = new Point(0, 0);
            const point2 = new Point(3, 4);
            expect(point1.distance(point2)).toBe(5);
        });

        test('should return 0 for distance to same point', () => {
            const point = new Point(2, 3);
            expect(point.distance(point)).toBe(0);
        });

        test('should handle negative coordinates', () => {
            const point1 = new Point(-1, -1);
            const point2 = new Point(2, 3);
            expect(point1.distance(point2)).toBe(5);
        });

        test('should be symmetric', () => {
            const point1 = new Point(1, 2);
            const point2 = new Point(4, 6);
            expect(point1.distance(point2)).toBe(point2.distance(point1));
        });
    });

    // Test distanceSquared method
    describe('distanceSquared', () => {
        test('should calculate correct squared distance between two points', () => {
            const point1 = new Point(0, 0);
            const point2 = new Point(3, 4);
            expect(point1.distanceSquared(point2)).toBe(25);
        });

        test('should return 0 for squared distance to same point', () => {
            const point = new Point(2, 3);
            expect(point.distanceSquared(point)).toBe(0);
        });

        test('should handle negative coordinates', () => {
            const point1 = new Point(-1, -1);
            const point2 = new Point(2, 3);
            expect(point1.distanceSquared(point2)).toBe(25);
        });

        test('should be symmetric', () => {
            const point1 = new Point(1, 2);
            const point2 = new Point(4, 6);
            expect(point1.distanceSquared(point2)).toBe(point2.distanceSquared(point1));
        });
    });
});

import { Point, HSegment } from '../../src/rectpack/geometry.js';

describe('HSegment', () => {
    let startPoint;
    let length;
    let hSegment;

    beforeEach(() => {
        startPoint = new Point(0, 5);
        length = 10;
        hSegment = new HSegment(startPoint, length);
    });

    describe('constructor', () => {
        it('should create a horizontal segment with valid start point and length', () => {
            expect(hSegment.start).toBe(startPoint);
            expect(hSegment.end.x).toBe(startPoint.x + length);
            expect(hSegment.end.y).toBe(startPoint.y);
        });

        it('should throw error when start point is invalid', () => {
            expect(() => new HSegment('not a point', 10)).toThrow('Start must be a Point and length must be a number');
        });

        it('should create a segment with negative length', () => {
            const negativeLength = -5;
            const negativeHSegment = new HSegment(startPoint, negativeLength);
            expect(negativeHSegment.start).toBe(startPoint);
            expect(negativeHSegment.end.x).toBe(startPoint.x + negativeLength);
            expect(negativeHSegment.end.y).toBe(startPoint.y);
        });
    });

    describe('length', () => {
        it('should return correct positive length', () => {
            expect(hSegment.length).toBe(10);
        });

        it('should return correct negative length', () => {
            const negativeHSegment = new HSegment(startPoint, -5);
            expect(negativeHSegment.length).toBe(-5);
        });

        it('should return zero for zero-length segment', () => {
            const zeroLengthSegment = new HSegment(startPoint, 0);
            expect(zeroLengthSegment.length).toBe(0);
        });
    });

    describe('inherited properties', () => {
        it('should calculate correct top and bottom values', () => {
            expect(hSegment.top).toBe(5);
            expect(hSegment.bottom).toBe(5);
        });

        it('should calculate correct left and right values', () => {
            expect(hSegment.left).toBe(0);
            expect(hSegment.right).toBe(10);
        });

        it('should have correct string representation', () => {
            expect(hSegment.toString()).toBe('S(P(0, 5), P(10, 5))');
        });
    });

    describe('equals', () => {
        it('should return true for identical horizontal segments', () => {
            const hSegment2 = new HSegment(new Point(0, 5), 10);
            expect(hSegment.equals(hSegment2)).toBe(true);
        });

        it('should return false for different horizontal segments', () => {
            const hSegment2 = new HSegment(new Point(0, 6), 10);
            expect(hSegment.equals(hSegment2)).toBe(false);
        });
    });
});
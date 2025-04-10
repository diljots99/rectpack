import { Point, VSegment } from '../../src/rectpack/geometry.js';

describe('VSegment', () => {
    let startPoint;
    let length;
    let vSegment;

    beforeEach(() => {
        startPoint = new Point(5, 0);
        length = 10;
        vSegment = new VSegment(startPoint, length);
    });

    describe('constructor', () => {
        it('should create a vertical segment with valid start point and length', () => {
            expect(vSegment.start).toBe(startPoint);
            expect(vSegment.end.x).toBe(startPoint.x);
            expect(vSegment.end.y).toBe(startPoint.y + length);
        });

        it('should throw error when start point is invalid', () => {
            expect(() => new VSegment('not a point', 10)).toThrow('Start must be a Point and length must be a number');
        });

        it('should create a segment with negative length', () => {
            const negativeLength = -5;
            const negativeVSegment = new VSegment(startPoint, negativeLength);
            expect(negativeVSegment.start).toBe(startPoint);
            expect(negativeVSegment.end.x).toBe(startPoint.x);
            expect(negativeVSegment.end.y).toBe(startPoint.y + negativeLength);
        });
    });

    describe('length', () => {
        it('should return correct positive length', () => {
            expect(vSegment.length).toBe(10);
        });

        it('should return correct negative length', () => {
            const negativeVSegment = new VSegment(startPoint, -5);
            expect(negativeVSegment.length).toBe(-5);
        });

        it('should return zero for zero-length segment', () => {
            const zeroLengthSegment = new VSegment(startPoint, 0);
            expect(zeroLengthSegment.length).toBe(0);
        });
    });

    describe('inherited properties', () => {
        it('should calculate correct left and right values', () => {
            expect(vSegment.left).toBe(5);
            expect(vSegment.right).toBe(5);
        });

        it('should calculate correct top and bottom values', () => {
            expect(vSegment.bottom).toBe(0);
            expect(vSegment.top).toBe(10);
        });

        it('should have correct string representation', () => {
            expect(vSegment.toString()).toBe('S(P(5, 0), P(5, 10))');
        });
    });

    describe('equals', () => {
        it('should return true for identical vertical segments', () => {
            const vSegment2 = new VSegment(new Point(5, 0), 10);
            expect(vSegment.equals(vSegment2)).toBe(true);
        });

        it('should return false for different vertical segments', () => {
            const vSegment2 = new VSegment(new Point(6, 0), 10);
            expect(vSegment.equals(vSegment2)).toBe(false);
        });
    });
});
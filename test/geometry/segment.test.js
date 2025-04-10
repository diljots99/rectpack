import { Point, Segment } from '../../src/rectpack/geometry.js';

describe('Segment', () => {
    let point1;
    let point2;
    let segment;

    beforeEach(() => {
        point1 = new Point(0, 0);
        point2 = new Point(3, 4);
        segment = new Segment(point1, point2);
    });

    describe('constructor', () => {
        it('should create a segment with valid points', () => {
            expect(segment.start).toBe(point1);
            expect(segment.end).toBe(point2);
        });

        it('should throw error when points are invalid', () => {
            expect(() => new Segment('not a point', point2)).toThrow('Start and end must be Point instances');
            expect(() => new Segment(point1, 'not a point')).toThrow('Start and end must be Point instances');
        });
    });

    describe('equals', () => {
        it('should return true for identical segments', () => {
            const segment2 = new Segment(new Point(0, 0), new Point(3, 4));
            expect(segment.equals(segment2)).toBe(true);
        });

        it('should return false for different segments', () => {
            const segment2 = new Segment(new Point(0, 0), new Point(5, 5));
            expect(segment.equals(segment2)).toBe(false);
        });

        it('should return false for non-segment objects', () => {
            expect(segment.equals('not a segment')).toBe(false);
        });
    });

    describe('toString', () => {
        it('should return correct string representation', () => {
            expect(segment.toString()).toBe('S(P(0, 0), P(3, 4))');
        });
    });

    describe('lengthSquared', () => {
        it('should return correct squared length', () => {
            // For points (0,0) and (3,4), lengthSquared should be 25 (3² + 4²)
            expect(segment.lengthSquared).toBe(25);
        });
    });

    describe('length', () => {
        it('should return correct length', () => {
            // For points (0,0) and (3,4), length should be 5
            expect(segment.length).toBe(5);
        });
    });

    describe('boundaries', () => {
        it('should calculate correct top value', () => {
            expect(segment.top).toBe(4);
        });

        it('should calculate correct bottom value', () => {
            expect(segment.bottom).toBe(0);
        });

        it('should calculate correct right value', () => {
            expect(segment.right).toBe(3);
        });

        it('should calculate correct left value', () => {
            expect(segment.left).toBe(0);
        });

        it('should handle segments with reversed points', () => {
            const reversedSegment = new Segment(new Point(3, 4), new Point(0, 0));
            expect(reversedSegment.top).toBe(4);
            expect(reversedSegment.bottom).toBe(0);
            expect(reversedSegment.right).toBe(3);
            expect(reversedSegment.left).toBe(0);
        });
    });
});
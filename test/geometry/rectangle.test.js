import { Point, Rectangle } from '../../src/rectpack/geometry.js';

describe('Rectangle', () => {
    let rectangle;

    beforeEach(() => {
        rectangle = new Rectangle(10, 20, 30, 40, 'rect1');
    });

    describe('constructor', () => {
        it('should create a rectangle with valid parameters', () => {
            expect(rectangle.x).toBe(10);
            expect(rectangle.y).toBe(20);
            expect(rectangle.width).toBe(30);
            expect(rectangle.height).toBe(40);
            expect(rectangle.rid).toBe('rect1');
        });

        it('should create a rectangle without rid', () => {
            const rectWithoutId = new Rectangle(10, 20, 30, 40);
            expect(rectWithoutId.rid).toBeNull();
        });

        it('should throw error for negative dimensions', () => {
            expect(() => new Rectangle(10, 20, -30, 40)).toThrow('Height and width must be non-negative');
            expect(() => new Rectangle(10, 20, 30, -40)).toThrow('Height and width must be non-negative');
        });
    });

    describe('boundaries', () => {
        it('should calculate correct bottom value', () => {
            expect(rectangle.bottom).toBe(20);
        });

        it('should calculate correct top value', () => {
            expect(rectangle.top).toBe(60); // y + height = 20 + 40
        });

        it('should calculate correct left value', () => {
            expect(rectangle.left).toBe(10);
        });

        it('should calculate correct right value', () => {
            expect(rectangle.right).toBe(40); // x + width = 10 + 30
        });
    });

    describe('corners', () => {
        it('should calculate correct top-left corner', () => {
            const corner = rectangle.cornerTopL;
            expect(corner instanceof Point).toBe(true);
            expect(corner.x).toBe(10);
            expect(corner.y).toBe(60);
        });

        it('should calculate correct top-right corner', () => {
            const corner = rectangle.cornerTopR;
            expect(corner.x).toBe(40);
            expect(corner.y).toBe(60);
        });

        it('should calculate correct bottom-right corner', () => {
            const corner = rectangle.cornerBotR;
            expect(corner.x).toBe(40);
            expect(corner.y).toBe(20);
        });

        it('should calculate correct bottom-left corner', () => {
            const corner = rectangle.cornerBotL;
            expect(corner.x).toBe(10);
            expect(corner.y).toBe(20);
        });
    });

    describe('area', () => {
        it('should calculate correct area', () => {
            expect(rectangle.area()).toBe(1200); // 30 * 40
        });

        it('should return zero for zero-width rectangle', () => {
            const zeroWidth = new Rectangle(10, 20, 0, 40);
            expect(zeroWidth.area()).toBe(0);
        });

        it('should return zero for zero-height rectangle', () => {
            const zeroHeight = new Rectangle(10, 20, 30, 0);
            expect(zeroHeight.area()).toBe(0);
        });
    });

    describe('move', () => {
        it('should update position correctly', () => {
            rectangle.move(50, 60);
            expect(rectangle.x).toBe(50);
            expect(rectangle.y).toBe(60);
        });
    });

    describe('contains', () => {
        it('should return true for contained rectangle', () => {
            const contained = new Rectangle(15, 25, 10, 10);
            expect(rectangle.contains(contained)).toBe(true);
        });

        it('should return false for overlapping rectangle', () => {
            const overlapping = new Rectangle(5, 15, 20, 20);
            expect(rectangle.contains(overlapping)).toBe(false);
        });

        it('should return false for non-intersecting rectangle', () => {
            const outside = new Rectangle(100, 100, 10, 10);
            expect(rectangle.contains(outside)).toBe(false);
        });
    });

    describe('intersects', () => {
        it('should return true for overlapping rectangles', () => {
            const overlapping = new Rectangle(20, 30, 30, 40);
            expect(rectangle.intersects(overlapping)).toBe(true);
        });

        it('should return false for non-intersecting rectangles', () => {
            const nonOverlapping = new Rectangle(100, 100, 10, 10);
            expect(rectangle.intersects(nonOverlapping)).toBe(false);
        });

        it('should handle edge cases correctly', () => {
            const touching = new Rectangle(40, 20, 10, 40);
            expect(rectangle.intersects(touching, false)).toBe(false);
            expect(rectangle.intersects(touching, true)).toBe(true);
        });
    });

    describe('intersection', () => {
        it('should return null for non-intersecting rectangles', () => {
            const nonOverlapping = new Rectangle(100, 100, 10, 10);
            expect(rectangle.intersection(nonOverlapping)).toBeNull();
        });

        it('should return correct intersection rectangle', () => {
            const overlapping = new Rectangle(20, 30, 30, 40);
            const intersection = rectangle.intersection(overlapping);
            expect(intersection.x).toBe(20);
            expect(intersection.y).toBe(30);
            expect(intersection.width).toBe(20);
            expect(intersection.height).toBe(30);
        });
    });

    describe('join', () => {
        it('should return true and not modify when containing other rectangle', () => {
            const contained = new Rectangle(15, 25, 10, 10);
            const originalX = rectangle.x;
            const originalY = rectangle.y;
            const originalWidth = rectangle.width;
            const originalHeight = rectangle.height;
            
            expect(rectangle.join(contained)).toBe(true);
            expect(rectangle.x).toBe(originalX);
            expect(rectangle.y).toBe(originalY);
            expect(rectangle.width).toBe(originalWidth);
            expect(rectangle.height).toBe(originalHeight);
        });

        it('should return true and update when other rectangle contains this', () => {
            const larger = new Rectangle(5, 15, 50, 50);
            expect(rectangle.join(larger)).toBe(true);
            expect(rectangle.x).toBe(5);
            expect(rectangle.y).toBe(15);
            expect(rectangle.width).toBe(50);
            expect(rectangle.height).toBe(50);
        });

        it('should join adjacent rectangles vertically', () => {
            const adjacent = new Rectangle(10, 60, 30, 20);
            expect(rectangle.join(adjacent)).toBe(true);
            expect(rectangle.x).toBe(10);
            expect(rectangle.y).toBe(20);
            expect(rectangle.width).toBe(30);
            expect(rectangle.height).toBe(60);
        });

        it('should join adjacent rectangles horizontally', () => {
            const adjacent = new Rectangle(40, 20, 20, 40);
            expect(rectangle.join(adjacent)).toBe(true);
            expect(rectangle.x).toBe(10);
            expect(rectangle.y).toBe(20);
            expect(rectangle.width).toBe(50);
            expect(rectangle.height).toBe(40);
        });

        it('should return false for non-adjacent rectangles', () => {
            const nonAdjacent = new Rectangle(100, 100, 10, 10);
            expect(rectangle.join(nonAdjacent)).toBe(false);
        });
    });
});
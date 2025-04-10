const { Rectangle } = require('../../src/rectpack/geometry');
const PackingAlgorithm = require('../../src/rectpack/packAlgo');

describe('PackingAlgorithm', () => {
    let packer;

    beforeEach(() => {
        packer = new PackingAlgorithm(100, 100);
    });

    describe('constructor', () => {
        it('should create packing algorithm with default values', () => {
            expect(packer.width).toBe(100);
            expect(packer.height).toBe(100);
            expect(packer.rot).toBe(true);
            expect(packer.bid).toBeNull();
            expect(packer.rectangles).toHaveLength(0);
        });

        it('should create packing algorithm with custom values', () => {
            const customPacker = new PackingAlgorithm(200, 150, false, 'test-id');
            expect(customPacker.width).toBe(200);
            expect(customPacker.height).toBe(150);
            expect(customPacker.rot).toBe(false);
            expect(customPacker.bid).toBe('test-id');
        });
    });

    describe('length', () => {
        it('should return correct number of rectangles', () => {
            expect(packer.length).toBe(0);
            packer.rectangles.push(new Rectangle(0, 0, 10, 10));
            expect(packer.length).toBe(1);
        });
    });

    describe('iterator', () => {
        it('should be iterable', () => {
            const rect1 = new Rectangle(0, 0, 10, 10);
            const rect2 = new Rectangle(20, 20, 10, 10);
            packer.rectangles.push(rect1, rect2);

            const items = [...packer];
            expect(items).toHaveLength(2);
            expect(items).toContain(rect1);
            expect(items).toContain(rect2);
        });
    });

    describe('_fitsSurface', () => {
        it('should throw error for non-positive dimensions', () => {
            expect(() => packer._fitsSurface(0, 10)).toThrow('Width and height must be positive');
            expect(() => packer._fitsSurface(10, 0)).toThrow('Width and height must be positive');
            expect(() => packer._fitsSurface(-10, 10)).toThrow('Width and height must be positive');
        });

        it('should handle rotation when enabled', () => {
            expect(packer._fitsSurface(120, 50)).toBe(true); // Will rotate to fit
            expect(packer._fitsSurface(120, 120)).toBe(false); // Too large even with rotation
        });

        it('should not rotate when disabled', () => {
            packer.rot = false;
            expect(packer._fitsSurface(120, 50)).toBe(false); // Won't rotate
            expect(packer._fitsSurface(50, 50)).toBe(true); // Fits without rotation
        });
    });

    describe('getItem', () => {
        it('should return rectangle at specified index', () => {
            const rect = new Rectangle(0, 0, 10, 10);
            packer.rectangles.push(rect);
            expect(packer.getItem(0)).toBe(rect);
        });

        it('should return undefined for invalid index', () => {
            expect(packer.getItem(0)).toBeUndefined();
        });
    });

    describe('usedArea', () => {
        it('should calculate total area of placed rectangles', () => {
            packer.rectangles.push(
                new Rectangle(0, 0, 10, 10), // area 100
                new Rectangle(20, 20, 5, 5)  // area 25
            );
            expect(packer.usedArea()).toBe(125);
        });

        it('should return 0 when no rectangles placed', () => {
            expect(packer.usedArea()).toBe(0);
        });
    });

    describe('abstract methods', () => {
        it('should throw error for unimplemented fitness method', () => {
            expect(() => packer.fitness(10, 10)).toThrow('Not implemented');
        });

        it('should throw error for unimplemented addRect method', () => {
            expect(() => packer.addRect(10, 10)).toThrow('Not implemented');
        });
    });

    describe('rectList', () => {
        it('should return correct list format', () => {
            packer.rectangles.push(
                new Rectangle(0, 0, 10, 10, 'rect1'),
                new Rectangle(20, 20, 5, 5, 'rect2')
            );
            const list = packer.rectList();
            expect(list).toEqual([
                [0, 0, 10, 10, 'rect1'],
                [20, 20, 5, 5, 'rect2']
            ]);
        });
    });

    describe('validatePacking', () => {
        it('should not throw for valid packing', () => {
            packer.rectangles.push(
                new Rectangle(0, 0, 10, 10),
                new Rectangle(20, 20, 10, 10)
            );
            expect(() => packer.validatePacking()).not.toThrow();
        });

        it('should throw for rectangles outside surface', () => {
            packer.rectangles.push(new Rectangle(95, 95, 10, 10));
            expect(() => packer.validatePacking()).toThrow('Rectangle placed outside surface');
        });

        it('should throw for colliding rectangles', () => {
            packer.rectangles.push(
                new Rectangle(0, 0, 20, 20),
                new Rectangle(10, 10, 20, 20)
            );
            expect(() => packer.validatePacking()).toThrow('Rectangle collision detected');
        });
    });

    describe('isEmpty', () => {
        it('should return true when no rectangles placed', () => {
            expect(packer.isEmpty()).toBe(true);
        });

        it('should return false when rectangles are placed', () => {
            packer.rectangles.push(new Rectangle(0, 0, 10, 10));
            expect(packer.isEmpty()).toBe(false);
        });
    });

    describe('reset', () => {
        it('should clear all placed rectangles', () => {
            packer.rectangles.push(
                new Rectangle(0, 0, 10, 10),
                new Rectangle(20, 20, 10, 10)
            );
            packer.reset();
            expect(packer.rectangles).toHaveLength(0);
            expect(packer.isEmpty()).toBe(true);
        });
    });
});

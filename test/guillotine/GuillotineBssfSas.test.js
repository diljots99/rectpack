const { Rectangle } = require('../../src/rectpack/geometry');
const { GuillotineBssfSas } = require('../../src/rectpack/guillotine');

describe('GuillotineBssfSas', () => {
    let packer;

    beforeEach(() => {
        packer = new GuillotineBssfSas(100, 100);
    });

    describe('constructor', () => {
        it('should create packer with default values', () => {
            expect(packer.width).toBe(100);
            expect(packer.height).toBe(100);
            expect(packer.rot).toBe(true);
            expect(packer._merge).toBe(true);
            expect(packer._sections).toHaveLength(1);
            expect(packer._sections[0]).toEqual(new Rectangle(0, 0, 100, 100,0));
        });

        it('should create packer with custom values', () => {
            const custom = new GuillotineBssfSas(200, 150, false, false, 'test-id');
            expect(custom.width).toBe(200);
            expect(custom.height).toBe(150);
            expect(custom.rot).toBe(false);
            expect(custom._merge).toBe(false);
            expect(custom.bid).toBe('test-id');
        });
    });

    describe('_section_fitness (BSSF)', () => {
        it('should return null for sections too small', () => {
            const section = new Rectangle(0, 0, 30, 30);
            expect(packer._section_fitness(section, 40, 20)).toBeNull();
        });

        it('should return minimum of remaining sides', () => {
            const section = new Rectangle(0, 0, 100, 100);
            // For a 60x40 rectangle in 100x100 section:
            // Remaining sides are: 100-60=40 and 100-40=60
            // BSSF should return the minimum = 40
            expect(packer._section_fitness(section, 60, 40)).toBe(40);
        });
    });

    describe('_split (SAS)', () => {
        it('should split horizontally when width < height', () => {
            const section = new Rectangle(0, 0, 50, 100);
            packer._sections = [];
            packer._split(section, 30, 40);
            
            // Should split horizontally because width (50) < height (100)
            expect(packer._sections).toHaveLength(2);
            expect(packer._sections).toContainEqual(new Rectangle(0, 40, 50, 60,0)); // Top section
            expect(packer._sections).toContainEqual(new Rectangle(30, 0, 20, 40,0)); // Right section
        });

        it('should split vertically when width >= height', () => {
            const section = new Rectangle(0, 0, 100, 50);
            packer._sections = [];
            packer._split(section, 30, 40);
            
            // Should split vertically because width (100) >= height (50)
            expect(packer._sections).toHaveLength(2);
            expect(packer._sections).toContainEqual(new Rectangle(0, 40, 30, 10,0)); // Top section
            expect(packer._sections).toContainEqual(new Rectangle(30, 0, 70, 50,0)); // Right section
        });
    });

    // describe('addRect', () => {
    //     it('should place rectangle using BSSF and SAS', () => {
    //         const rect = packer.addRect(60, 40, 'test');
    //         expect(rect).toBeTruthy();
    //         expect(rect.width).toBe(60);
    //         expect(rect.height).toBe(40);
    //         expect(rect.x).toBe(0);
    //         expect(rect.y).toBe(0);
            
    //         // Verify sections were split according to SAS rule
    //         expect(packer._sections).toHaveLength(2);
    //         // Since width (100) >= height (100), it should split vertically
    //         expect(packer._sections[0]).toContainEqual(new Rectangle(0, 40, 60, 60,0)); // Top section
    //         expect(packer._sections[1]).toContainEqual(new Rectangle(60, 0, 40, 100,0)); // Right section
    //     });

    //     it('should handle multiple rectangles', () => {
    //         const rect1 = packer.addRect(60, 40, 'rect1');
    //         const rect2 = packer.addRect(30, 30, 'rect2');
            
    //         expect(rect1).toBeTruthy();
    //         expect(rect2).toBeTruthy();
    //         expect(packer.rectangles).toHaveLength(2);
    //     });

    //     it('should utilize rotation when beneficial', () => {
    //         packer._sections = [new Rectangle(0, 0, 100, 130,0)];
    //         const rect = packer.addRect(120, 30);
    //         expect(rect).toBeTruthy();
    //         expect(rect.width).toBe(30);
    //         expect(rect.height).toBe(120);
    //     });

    //     it('should return null when rectangle cannot be placed', () => {
    //         packer.addRect(90, 90); // Fill most of the space
    //         const rect = packer.addRect(50, 50); // Try to place another large rectangle
    //         expect(rect).toBeNull();
    //     });
    // });

    describe('fitness', () => {
        it('should calculate correct fitness for placeable rectangles', () => {
            const fitness = packer.fitness(60, 40);
            expect(fitness).toBe(40); // min(100-60, 100-40) = 40
        });

        it('should handle rotation in fitness calculation', () => {
            packer._sections = [new Rectangle(0, 0, 100, 130,0)];
            const fitness = packer.fitness(120, 30);
            expect(fitness).toBe(10); // min(100-30, 100-120) after rotation
        });

        it('should return null for unplaceable rectangles', () => {
            const fitness = packer.fitness(150, 150);
            expect(fitness).toBeNull();
        });
    });

    describe('reset', () => {
        it('should restore initial state', () => {
            packer.addRect(60, 40);
            packer.addRect(30, 30);
            packer.reset();
            
            expect(packer.rectangles).toHaveLength(0);
            expect(packer._sections).toHaveLength(1);
            expect(packer._sections[0]).toEqual(new Rectangle(0, 0, 100, 100,0));
        });
    });
});

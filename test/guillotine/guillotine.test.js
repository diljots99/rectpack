const { Rectangle } = require('../../src/rectpack/geometry');
const { Guillotine } = require('../../src/rectpack/guillotine');

describe('Guillotine', () => {
    let guillotine;

    beforeEach(() => {
        guillotine = new Guillotine(100, 100);
    });

    describe('constructor', () => {
        it('should create guillotine with default values', () => {
            expect(guillotine.width).toBe(100);
            expect(guillotine.height).toBe(100);
            expect(guillotine.rot).toBe(true);
            expect(guillotine._merge).toBe(true);
            expect(guillotine._sections).toHaveLength(1);
            expect(guillotine._sections[0]).toEqual(new Rectangle(0, 0, 100, 100,0));
        });

        it('should create guillotine with custom values', () => {
            const custom = new Guillotine(200, 150, false, false, 'test-id');
            expect(custom.width).toBe(200);
            expect(custom.height).toBe(150);
            expect(custom.rot).toBe(false);
            expect(custom._merge).toBe(false);
            expect(custom.bid).toBe('test-id');
        });
    });

    describe('_add_section', () => {
        it('should add section when merge is disabled', () => {
            guillotine._merge = false;
            const section = new Rectangle(10, 10, 50, 50);
            guillotine._add_section(section);
            expect(guillotine._sections).toContainEqual(section);
            expect(section.rid).toBe(0);
        });

        it('should merge sections when possible', () => {
            guillotine._sections = [];
            const section1 = new Rectangle(0, 0, 50, 100);
            const section2 = new Rectangle(50, 0, 50, 100);
            guillotine._add_section(section1);
            guillotine._add_section(section2);
            expect(guillotine._sections).toHaveLength(1);
            expect(guillotine._sections[0]).toEqual(new Rectangle(0, 0, 100, 100,0));
        });
    });

    describe('_split_horizontal', () => {
        it('should create correct sections after horizontal split', () => {
            const section = new Rectangle(0, 0, 100, 100);
            guillotine._sections = [];
            guillotine._split_horizontal(section, 60, 40);
            
            expect(guillotine._sections).toHaveLength(2);
            expect(guillotine._sections).toContainEqual(new Rectangle(0, 40, 100, 60,0)); // Top section
            expect(guillotine._sections).toContainEqual(new Rectangle(60, 0, 40, 40,0)); // Right section
        });

        it('should handle split when width equals section width', () => {
            const section = new Rectangle(0, 0, 100, 100);
            guillotine._sections = [];
            guillotine._split_horizontal(section, 100, 40);
            
            expect(guillotine._sections).toHaveLength(1);
            expect(guillotine._sections[0]).toEqual(new Rectangle(0, 40, 100, 60,0));
        });
    });

    describe('_split_vertical', () => {
        it('should create correct sections after vertical split', () => {
            const section = new Rectangle(0, 0, 100, 100);
            guillotine._sections = [];
            guillotine._split_vertical(section, 60, 40);
            
            expect(guillotine._sections).toHaveLength(2);
            expect(guillotine._sections).toContainEqual(new Rectangle(0, 40, 60, 60,0)); // Top section
            expect(guillotine._sections).toContainEqual(new Rectangle(60, 0, 40, 100,0)); // Right section
        });

        it('should handle split when height equals section height', () => {
            const section = new Rectangle(0, 0, 100, 100);
            guillotine._sections = [];
            guillotine._split_vertical(section, 60, 100);
            
            expect(guillotine._sections).toHaveLength(1);
            expect(guillotine._sections[0]).toEqual(new Rectangle(60, 0, 40, 100,0));
        });
    });

    describe('_select_fittest_section', () => {
        class TestGuillotine extends Guillotine {
            _section_fitness(section, width, height) {
                if (width > section.width || height > section.height) {
                    return null;
                }
                return Math.min(section.width - width, section.height - height);
            }

            _split(section, width, height) {
                if (section.width < section.height) {
                    return this._split_horizontal(section, width, height);
                } else {
                    return this._split_vertical(section, width, height);
                }
            }
        }

        let testGuillotine;

        beforeEach(() => {
            testGuillotine = new TestGuillotine(100, 100);
        });

        it('should select best fitting section', () => {
            const [section, rotated] = testGuillotine._select_fittest_section(50, 50);
            expect(section).toBeTruthy();
            expect(rotated).toBe(false);
        });

        it('should handle rotation when enabled', () => {
            testGuillotine._add_section(new Rectangle(0, 0, 100, 120,0));
            const [section, rotated] = testGuillotine._select_fittest_section(120, 50);
            expect(section).toBeTruthy();
            expect(rotated).toBe(true);
        });

        it('should return null when no fit is possible', () => {
            const [section, rotated] = testGuillotine._select_fittest_section(150, 150);
            expect(section).toBeNull();
            expect(rotated).toBeNull();
        });
    });

    describe('addRect', () => {
        class TestGuillotine extends Guillotine {
            _section_fitness(section, width, height) {
                if (width > section.width || height > section.height) {
                    return null;
                }
                return Math.min(section.width - width, section.height - height);
            }

            _split(section, width, height) {
                if (section.width < section.height) {
                    return this._split_horizontal(section, width, height);
                } else {
                    return this._split_vertical(section, width, height);
                }
            }
        }

        let testGuillotine;

        beforeEach(() => {
            testGuillotine = new TestGuillotine(100, 100);
        });

        it('should add rectangle successfully', () => {
            const rect = testGuillotine.addRect(50, 50, 'test');
            expect(rect).toBeTruthy();
            expect(rect.width).toBe(50);
            expect(rect.height).toBe(50);
            expect(rect.rid).toBe('test');
        });

        it('should handle rotation when needed', () => {
            testGuillotine._add_section(new Rectangle(0, 0, 100, 120,0));
            const rect = testGuillotine.addRect(120, 50);
            expect(rect).toBeTruthy();
            expect(rect.width).toBe(50);
            expect(rect.height).toBe(120);
        });

        it('should return null when rectangle cannot be placed', () => {
            const rect = testGuillotine.addRect(150, 150);
            expect(rect).toBeNull();
        });

        it('should throw error for invalid dimensions', () => {
            expect(() => testGuillotine.addRect(0, 50)).toThrow('Width and height must be positive');
            expect(() => testGuillotine.addRect(50, 0)).toThrow('Width and height must be positive');
            expect(() => testGuillotine.addRect(-50, 50)).toThrow('Width and height must be positive');
        });
    });

    describe('fitness', () => {
        class TestGuillotine extends Guillotine {
            _section_fitness(section, width, height) {
                if (width > section.width || height > section.height) {
                    return null;
                }
                return Math.min(section.width - width, section.height - height);
            }

            _split(section, width, height) {
                if (section.width < section.height) {
                    return this._split_horizontal(section, width, height);
                } else {
                    return this._split_vertical(section, width, height);
                }
            }
        }

        let testGuillotine;

        beforeEach(() => {
            testGuillotine = new TestGuillotine(100, 130);
        });

        it('should calculate fitness correctly', () => {

            const fitness = testGuillotine.fitness(50, 50);
            expect(fitness).toBe(50);
        });

        it('should handle rotation in fitness calculation', () => {
            const fitness = testGuillotine.fitness(120, 50);
            expect(fitness).toBe(10);
        });

        it('should return null when no fit is possible', () => {
            const fitness = testGuillotine.fitness(150, 150);
            expect(fitness).toBeNull();
        });

        it('should throw error for invalid dimensions', () => {
            expect(() => testGuillotine.fitness(0, 50)).toThrow('Width and height must be positive');
            expect(() => testGuillotine.fitness(50, 0)).toThrow('Width and height must be positive');
            expect(() => testGuillotine.fitness(-50, 50)).toThrow('Width and height must be positive');
        });
    });

    describe('reset', () => {
        it('should reset to initial state', () => {
            const testGuillotine = new Guillotine(100, 100);
            testGuillotine.rectangles.push(new Rectangle(0, 0, 50, 50,0));
            // testGuillotine.addRect(50, 50);
            testGuillotine.reset();
            
            expect(testGuillotine.rectangles).toHaveLength(0);
            expect(testGuillotine._sections).toHaveLength(1);
            expect(testGuillotine._sections[0]).toEqual(new Rectangle(0, 0, 100, 100,0));
        });
    });
});

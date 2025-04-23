// const { Rectangle } = require('../../src/rectpack/geometry');
// const { 
//     SkylineBl, 
//     SkylineBlWm, 
//     SkylineMwf,
//     SkylineMwfl,
//     SkylineMwflWm 
// } = require('../../src/rectpack/skyline');

// describe('TestSkyline', () => {
//     test('test_init', () => {
//         const s = new SkylineBl(100, 100, false);
//         const rect1 = s.addRect(30, 30);
//         const rect2 = s.addRect(100, 70);
//         expect(rect1).toEqual(new Rectangle(0, 0, 30, 30));
//         expect(rect2).toEqual(new Rectangle(0, 30, 100, 70));
//     });

//     test('test_rotation', () => {
//         // Test rotation is enabled by default
//         const s1 = new SkylineBl(100, 10);
//         const rect1 = s1.addRect(10, 100);
//         expect(rect1).toEqual(new Rectangle(0, 0, 100, 10));

//         // Test rotation can be disabled
//         const s2 = new SkylineBl(100, 10, false);
//         const rect2 = s2.addRect(10, 100);
//         expect(rect2).toBeNull();
//     });

//     test('test_waste_management', () => {
//         // Generate one wasted section
//         const s = new SkylineBlWm(100, 100, false);
//         const rect1 = s.addRect(30, 30);
//         const rect2 = s.addRect(100, 70);
//         expect(rect1).toEqual(new Rectangle(0, 0, 30, 30));
//         expect(rect2).toEqual(new Rectangle(0, 30, 100, 70));
//         expect(s.rectangles.length).toBe(2);
        
//         // Add rectangle that only fits into wasted section
//         expect(s.addRect(71, 30)).toBeNull();
//         expect(s.addRect(70, 31)).toBeNull();
//         const rect3 = s.addRect(70, 30);
//         expect(rect3).toEqual(new Rectangle(30, 0, 70, 30));
//         expect(s.rectangles.length).toBe(3);
        
//         const rect4 = s.addRect(70, 30);
//         expect(rect4).toBeNull();

//         // Test the same without waste management
//         const s2 = new SkylineBl(100, 100);
//         const rect5 = s2.addRect(30, 30);
//         const rect6 = s2.addRect(100, 70);
//         expect(rect5).toEqual(new Rectangle(0, 0, 30, 30));
//         expect(rect6).toEqual(new Rectangle(0, 30, 100, 70));
        
//         expect(s2.addRect(70, 30)).toBeNull();
//         expect(s2.rectangles.length).toBe(2);
//     });

//     test('test_iter', () => {
//         const s = new SkylineBlWm(100, 100);
//         expect(s.addRect(50, 50)).toBeTruthy();
//         expect(s.addRect(100, 50)).toBeTruthy();
//         expect(s.rectangles.length).toBe(2);
//         expect(s.addRect(40, 40)).toBeTruthy();
//         expect(s.rectangles.length).toBe(3);
//     });

//     test('test_len', () => {
//         const s = new SkylineBlWm(100, 100);
//         expect(s.addRect(50, 50)).toBeTruthy();
//         expect(s.addRect(100, 50)).toBeTruthy();
//         expect(s.rectangles.length).toBe(2);
//         expect(s.addRect(50, 50)).toBeTruthy();
//         expect(s.rectangles.length).toBe(3);
//     });
// });

// describe('TestSkylineMwf', () => {
//     test('test_init', () => {
//         const p = new SkylineMwf(100, 100);
//         expect(p._waste_management).toBe(false);
//     });

//     test('test_fitness', () => {
//         const p = new SkylineMwf(100, 100, false);
//         p.addRect(20, 20);
//         expect(p.fitness(90, 10)).toBeLessThan(p.fitness(100, 10));
//     });
// });

// describe('TestSkylineMwFwm', () => {
//     test('test_init', () => {
//         const p = new SkylineMwfWm(100, 100);
//         expect(p._waste_management).toBe(true);
//     });
// });

// describe('TestSkylineMwfl', () => {
//     test('test_init', () => {
//         const p = new SkylineMwfl(100, 100);
//         expect(p._waste_management).toBe(false);
//     });

//     test('test_fitness', () => {
//         const p = new SkylineMwfl(100, 100, false);
//         p.addRect(20, 20);
//         expect(p.fitness(90, 10)).toBeLessThan(p.fitness(90, 20));
//     });
// });

// describe('TestSkylineBl', () => {
//     test('test_init', () => {
//         const p = new SkylineBl(100, 100);
//         expect(p._waste_management).toBe(false);
//     });

//     test('test_fitness', () => {
//         const p = new SkylineBl(100, 100, false);
//         expect(p.fitness(100, 20)).toBe(p.fitness(10, 20));
//         expect(p.fitness(100, 10)).toBeLessThan(p.fitness(100, 11));

//         // The same but with wasted space
//         const p2 = new SkylineBl(100, 100, false);
//         p2.addRect(80, 50);
//         expect(p2.fitness(100, 10)).toBe(p2.fitness(80, 10));
//         expect(p2.fitness(100, 10)).toBeLessThan(p2.fitness(40, 20));
//     });
// });
        
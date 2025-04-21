const { Rectangle } = require('../../src/rectpack/geometry');
const WasteManager = require('../../src/rectpack/waste').default;

describe('TestWaste', () => {
    test('test_init', () => {
        const w = new WasteManager();
        expect(w).toBeDefined();
    });

    test('test_add_waste', () => {
        const w = new WasteManager();
        w.addWaste(30, 40, 50, 50);
        w.addWaste(5, 5, 20, 20);
        w.addWaste(0, 100, 100, 100);

        const rect1 = w.addRect(20, 20);
        const rect2 = w.addRect(45, 40);
        const rect3 = w.addRect(90, 80);
        const rect4 = w.addRect(100, 100);
        const rect5 = w.addRect(10, 10);
            
        expect(rect1).toEqual(new Rectangle(5, 5, 20, 20));
        expect(rect2).toEqual(new Rectangle(30, 40, 45, 40));
        expect(rect3).toEqual(new Rectangle(0, 100, 90, 80));
        expect(rect4).toBeNull();
        expect(rect5).toEqual(new Rectangle(30, 80, 10, 10));
        
        expect(w.rectangles.length).toBe(4);

        // Test merge is enabled for new waste 
        const w2 = new WasteManager();
        w2.addWaste(0, 0, 50, 50);
        w2.addWaste(50, 0, 50, 50);
        expect(w2._sections.length).toBe(1);
        expect(w2.addRect(100, 50)).toEqual(new Rectangle(0, 0, 100, 50));
    });

    test('test_empty', () => {
        // Test it is empty by default
        const w = new WasteManager();
        expect(w.addRect(1, 1)).toBeFalsy();
    });

    test('test_add_rect', () => {
        const w = new WasteManager(false);
        w.addWaste(50, 40, 100, 40);
        expect(w.addRect(30, 80)).toBeNull();

        // Test with rotation
        const w2 = new WasteManager(true);
        w2.addWaste(50, 40, 100, 40);
        expect(w2.addRect(30, 80)).toEqual(new Rectangle(50, 40, 80, 30));

        // Test rectangle rid
        const w3 = new WasteManager(true);
        w3.addWaste(50, 40, 100, 40);
        const rect = w3.addRect(30, 80, 23);
        expect(rect.rid).toBe(23);
    });

    test('test_iter', () => {
        // Iterate through rectangles
        const w = new WasteManager();
        w.addWaste(30, 40, 50, 50);
        w.addWaste(5, 5, 20, 20);
        w.addWaste(0, 100, 100, 100);

        w.addRect(50, 50);

        for (const r of w.rectangles) {
            expect(r).toEqual(new Rectangle(30, 40, 50, 50));
        }

        expect(w.rectangles.length).toBe(1);
    });
});
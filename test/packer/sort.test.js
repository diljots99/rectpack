const { 
    float2dec,
    SORT_AREA,
    SORT_PERI,
    SORT_DIFF,
    SORT_SSIDE,
    SORT_LSIDE,
    SORT_RATIO,
    SORT_NONE
} = require('../../src/rectpack/packer');

describe('Utility Functions', () => {
    describe('float2dec', () => {
        it('should round up float numbers to specified decimal places', () => {
            expect(float2dec(3.14159, 2)).toBe(3.15);
            expect(float2dec(2.001, 2)).toBe(2.01);
            expect(float2dec(5.555, 1)).toBe(5.6);
            expect(float2dec(10.123456, 3)).toBe(10.124);
        });

        it('should handle whole numbers', () => {
            expect(float2dec(5, 2)).toBe(5);
            expect(float2dec(100, 3)).toBe(100);
        });

        it('should handle zero', () => {
            expect(float2dec(0, 2)).toBe(0);
            expect(float2dec(0.0, 3)).toBe(0);
        });

        it('should handle negative numbers', () => {
            expect(float2dec(-3.14159, 2)).toBe(-3.14);
            expect(float2dec(-2.001, 1)).toBe(-2);
        });
    });
});

describe('Sorting Functions', () => {
    // Test data
    const rectangles = [
        [2, 3],   // area: 6,  perimeter: 10, ratio: 0.67
        [5, 2],   // area: 10, perimeter: 14, ratio: 2.5
        [4, 4],   // area: 16, perimeter: 16, ratio: 1
        [1, 6],   // area: 6,  perimeter: 14, ratio: 0.17
        [3, 3]    // area: 9,  perimeter: 12, ratio: 1
    ];

    describe('SORT_AREA', () => {
        it('should sort rectangles by area in descending order', () => {
            const sorted = SORT_AREA(rectangles);
            expect(sorted).toEqual([
                [4, 4],  // area: 16
                [5, 2],  // area: 10
                [3, 3],  // area: 9
                [2, 3],  // area: 6
                [1, 6]   // area: 6
            ]);
        });

        it('should not modify original array', () => {
            const original = [...rectangles];
            SORT_AREA(rectangles);
            expect(rectangles).toEqual(original);
        });
    });

    describe('SORT_PERI', () => {
        it('should sort rectangles by perimeter in descending order', () => {
            const sorted = SORT_PERI(rectangles);
            expect(sorted).toEqual([
                [4, 4],  // perimeter: 16
                [5, 2],  // perimeter: 14
                [1, 6],  // perimeter: 14
                [3, 3],  // perimeter: 12
                [2, 3]   // perimeter: 10
            ]);
        });
    });

    describe('SORT_DIFF', () => {
        it('should sort rectangles by absolute difference of sides in descending order', () => {
            const sorted = SORT_DIFF(rectangles);
            expect(sorted).toEqual([
                [1, 6],  // diff: 5
                [5, 2],  // diff: 3
                [2, 3],  // diff: 1
                [4, 4],  // diff: 0
                [3, 3]   // diff: 0
            ]);
        });
    });

    describe('SORT_SSIDE', () => {
        it('should sort rectangles by shorter side in descending order', () => {
            const sorted = SORT_SSIDE(rectangles);
            expect(sorted).toEqual([
                [4, 4],  // min side: 4
                [3, 3],  // min side: 3
                [5, 2],  // min side: 2
                [2, 3],  // min side: 2
                [1, 6]   // min side: 1
            ]);
        });

        it('should use longer side as tiebreaker', () => {
            const testData = [[2, 5], [2, 4], [2, 6]];
            const sorted = SORT_SSIDE(testData);
            expect(sorted).toEqual([
                [2, 6],  // min: 2, max: 6
                [2, 5],  // min: 2, max: 5
                [2, 4]   // min: 2, max: 4
            ]);
        });
    });

    describe('SORT_LSIDE', () => {
        it('should sort rectangles by longer side in descending order', () => {
            const sorted = SORT_LSIDE(rectangles);
            expect(sorted).toEqual([
                [1, 6],  // max side: 6
                [5, 2],  // max side: 5
                [4, 4],  // max side: 4
                [3, 3],  // max side: 3
                [2, 3]   // max side: 3
            ]);
        });

        it('should use shorter side as tiebreaker', () => {
            const testData = [[6, 2], [6, 3], [6, 1]];
            const sorted = SORT_LSIDE(testData);
            expect(sorted).toEqual([
                [6, 3],
                [6, 2],
                [6, 1]
            ]);
        });
    });

    describe('SORT_RATIO', () => {
        it('should sort rectangles by width/height ratio in descending order', () => {
            const sorted = SORT_RATIO(rectangles);
            expect(sorted).toEqual([
                [5, 2],  // ratio: 2.5
                [4, 4],  // ratio: 1
                [3, 3],  // ratio: 1
                [2, 3],  // ratio: 0.67
                [1, 6]   // ratio: 0.17
            ]);
        });
    });

    describe('SORT_NONE', () => {
        it('should return a new array with same order', () => {
            const sorted = SORT_NONE(rectangles);
            expect(sorted).toEqual(rectangles);
            expect(sorted).not.toBe(rectangles); // Should be a new array
        });

        it('should not modify original array', () => {
            const original = [...rectangles];
            SORT_NONE(rectangles);
            expect(rectangles).toEqual(original);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty arrays', () => {
            const emptyArray = [];
            expect(SORT_AREA(emptyArray)).toEqual([]);
            expect(SORT_PERI(emptyArray)).toEqual([]);
            expect(SORT_DIFF(emptyArray)).toEqual([]);
            expect(SORT_SSIDE(emptyArray)).toEqual([]);
            expect(SORT_LSIDE(emptyArray)).toEqual([]);
            expect(SORT_RATIO(emptyArray)).toEqual([]);
            expect(SORT_NONE(emptyArray)).toEqual([]);
        });

        it('should handle single-element arrays', () => {
            const singleRect = [[3, 4]];
            expect(SORT_AREA(singleRect)).toEqual([[3, 4]]);
            expect(SORT_PERI(singleRect)).toEqual([[3, 4]]);
            expect(SORT_DIFF(singleRect)).toEqual([[3, 4]]);
            expect(SORT_SSIDE(singleRect)).toEqual([[3, 4]]);
            expect(SORT_LSIDE(singleRect)).toEqual([[3, 4]]);
            expect(SORT_RATIO(singleRect)).toEqual([[3, 4]]);
            expect(SORT_NONE(singleRect)).toEqual([[3, 4]]);
        });

        it('should handle arrays with identical rectangles', () => {
            const identicalRects = [[2, 3], [2, 3], [2, 3]];
            expect(SORT_AREA(identicalRects)).toEqual(identicalRects);
            expect(SORT_PERI(identicalRects)).toEqual(identicalRects);
            expect(SORT_DIFF(identicalRects)).toEqual(identicalRects);
            expect(SORT_SSIDE(identicalRects)).toEqual(identicalRects);
            expect(SORT_LSIDE(identicalRects)).toEqual(identicalRects);
            expect(SORT_RATIO(identicalRects)).toEqual(identicalRects);
            expect(SORT_NONE(identicalRects)).toEqual(identicalRects);
        });
    });
});

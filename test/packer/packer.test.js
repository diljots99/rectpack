const { 
  SORT_NONE,
  SORT_AREA,
  SORT_PERI,
  SORT_DIFF,
  SORT_SSIDE,
  SORT_LSIDE,
  SORT_RATIO,
  PackerOnlineBNF,
  PackerOnlineBFF,
  PackerOnlineBBF,
  PackerBNF,
  PackerBFF,
  PackerBBF,
  PackerGlobal,
  PackingMode,
  PackingBin,
  newPacker
} = require('../../src/rectpack/packer');

const { GuillotineBafSas, GuillotineBssfSas, GuillotineBafMaxas, GuillotineBlsfMaxas } = require('../../src/rectpack/guillotine');
// const { SkylineMwfl, SkylineBl } = require('../../src/rectpack/skyline');

describe('Rectangle Sort Tests', () => {
  test('sort none returns list as is', () => {
    const a = [[3, 3], [3, 1], [3, 2], [1, 2], [2, 1]];
    const ordered = SORT_NONE(a);
    expect(ordered).toEqual(a);
    
    // Test empty list
    expect(SORT_NONE([])).toEqual([]);
  });

  test('sort area sorts rectangles by descending area', () => {
    const a = [[5, 5], [7, 7], [3, 4], [100, 1]];
    const ordered = SORT_AREA(a);
    expect(ordered).toEqual([[100, 1], [7, 7], [5, 5], [3, 4]]);
    
    // Test empty list
    expect(SORT_AREA([])).toEqual([]);
  });

  test('sort perimeter sorts rectangles by perimeter', () => {
    const a = [[5, 5], [7, 7], [3, 4], [40, 1]];
    const ordered = SORT_PERI(a);
    expect(ordered).toEqual([[40, 1], [7, 7], [5, 5], [3, 4]]);
    
    // Test empty list
    expect(SORT_PERI([])).toEqual([]);
  });

  test('sort diff sorts rectangles by difference in side lengths', () => {
    const a = [[7, 1], [1, 9], [2, 11], [5, 1]];
    const ordered = SORT_DIFF(a);
    expect(ordered).toEqual([[2, 11], [1, 9], [7, 1], [5, 1]]);
    
    // Test empty list
    expect(SORT_DIFF([])).toEqual([]);
  });

  test('sort short side sorts rectangles by short side descending', () => {
    const a = [[2, 9], [7, 3], [4, 5], [11, 3]];
    const ordered = SORT_SSIDE(a);
    expect(ordered).toEqual([[4, 5], [11, 3], [7, 3], [2, 9]]);
    
    // Test empty list
    expect(SORT_SSIDE([])).toEqual([]);
  });

  test('sort long side sorts rectangles by long side descending', () => {
    const a = [[19, 5], [32, 5], [6, 19], [9, 11]];
    const ordered = SORT_LSIDE(a);
    expect(ordered).toEqual([[32, 5], [6, 19], [19, 5], [9, 11]]);
    
    // Test empty list
    expect(SORT_LSIDE([])).toEqual([]);
  });

  test('sort ratio sorts rectangles by width/height descending', () => {
    const a = [[12, 5], [15, 4], [4, 1], [1, 2]];
    const ordered = SORT_RATIO(a);
    expect(ordered).toEqual([[4, 1], [15, 4], [12, 5], [1, 2]]);
    
    // Test empty list
    expect(SORT_RATIO([])).toEqual([]);
  });
});

describe('PackerOnline Tests', () => {
  test('bin iteration only loops over closed and open bins', async () => {
    const p = new PackerOnlineBNF( GuillotineBssfSas, false );
    p.addBin(50, 55);
    p.addBin(30, 30);
    p.addBin(5, 5);
    p.addBin(40, 40);

    // No bins to iterate over
    const bins = Array.from(p);
    expect(bins.length).toBe(0);

    // One open bin to iterate
    await p.addRect(50, 50);
    const binsAfterOneRect = Array.from(p);
    expect(binsAfterOneRect.length).toBe(1);

    // One closed and one open bin
    await p.addRect(29, 29);
    const binsAfterTwoRects = Array.from(p);
    expect(binsAfterTwoRects.length).toBe(2);
    expect(binsAfterTwoRects[0].width).toBe(50); // Test closed bins are first

    // Two closed bins, one skipped bin, and an open bin
    await p.addRect(40, 40);
    const binsAfterThreeRects = Array.from(p);
    expect(binsAfterThreeRects.length).toBe(3);
  });

  test('bin order - bins are packed in order they were added', async () => {
    const p = new PackerOnlineBNF( GuillotineBssfSas, false );
    p.addBin(45, 45);
    p.addBin(30, 30);
    p.addBin(40, 40);

    await p.addRect(20, 20);
    expect(p.length).toBe(1);
    const firstBin = Array.from(p)[0];
    expect(firstBin.width).toBe(45);
    expect(firstBin.height).toBe(45);

    await p.addRect(29, 29);
    expect(p.length).toBe(2);
    const secondBin = Array.from(p)[1];
    expect(secondBin.width).toBe(30);
    expect(secondBin.height).toBe(30);

    // Check bins are added at the end of the queue and used last
    p.addBin(39, 39);
    await p.addRect(39, 39);
    expect(p.length).toBe(3);
    const thirdBin = Array.from(p)[2];
    expect(thirdBin.width).toBe(40);
    expect(thirdBin.height).toBe(40);
  });
});

describe('PackerOnlineBNF Tests', () => {
  test('bin selection - closes bin after failed packing attempt', async () => {
    const p = new PackerOnlineBNF( GuillotineBssfSas, false );
    p.addBin(30, 30);
    p.addBin(10, 10);
    p.addBin(40, 40);

    // This rectangle fits into first bin
    await p.addRect(5, 5);
    expect(p.length).toBe(1);
    expect(Array.from(p)[0].width).toBe(30);

    // This rectangle doesn't fit into the open bin (first), so the bin
    // is closed and rectangle packed into next one where it fits
    await p.addRect(29, 29);
    expect(p.length).toBe(2);
    expect(Array.from(p)[1].width).toBe(40);

    // Try to add a rectangle that would have fit into the first bin
    // but it is packed since first bin is closed
    await p.addRect(10, 10);
    expect(p.length).toBe(2);
    const rectList = p.rectList();
    const lastRect = rectList[rectList.length - 1];
    const [binIndex, x, y, w, h, rid] = lastRect;
    expect(binIndex).toBe(1);
  });

  test('infinite bins are only tested once when rectangle doesnt fit', async () => {
    const p = new PackerOnlineBNF();
    p.addBin(50, 50, 50);
    p.addBin(100, 100, Infinity);

    await p.addRect(90, 90);
    expect(p.length).toBe(1);
    await p.addRect(95, 95);
    expect(p.length).toBe(2);

    // Check other bins
    await p.addRect(40, 40);
    expect(p.length).toBe(3);
    expect(Array.from(p)[2].width).toBe(50);

    await p.addRect(45, 45);
    expect(p.length).toBe(4);
    expect(Array.from(p)[3].width).toBe(50);
  });

  test('rotation handling', async () => {
    const p = new PackerOnlineBNF( GuillotineBssfSas, false );
    await p.addBin(30, 10);
    await p.addBin(50, 10);
    await p.addRect(10, 30);

    // Rectangle didn't fit in any bins when rotation was disabled
    expect(p.rectList().length).toBe(0);
    expect(p.length).toBe(0);

    // With rotation the rectangle is successfully packed
    const p2 = new PackerOnlineBNF( GuillotineBssfSas, true );
    await p2.addBin(30, 10);
    await p2.addBin(50, 10);
    await p2.addRect(10, 30);
    expect(p2.rectList()[0]).toEqual([0, 0, 0, 30, 10, null]);
    expect(p2.length).toBe(1);
  });
});

describe('PackerOnlineBFF Tests', () => {
  test('bin selection - packs into first bin where it fits', async () => {
    const p = new PackerOnlineBFF(
      GuillotineBafSas,
      false   
    );

    p.addBin(20, 20, 2);
    p.addBin(100, 100);

    // Packed into second bin
    await p.addRect(90, 90);
    expect(p.length).toBe(1);
    expect(Array.from(p)[0].width).toBe(100);

    // Rectangles are packed into open bins whenever possible
    await p.addRect(10, 10);
    expect(p.length).toBe(1);
    expect(p.rectList().length).toBe(2);

    await p.addRect(5, 5);
    expect(p.length).toBe(1);
    expect(p.rectList().length).toBe(3);

    // Rectangle doesn't fit, open new bin
    await p.addRect(15, 15);
    expect(p.length).toBe(2);
    expect(p.rectList().length).toBe(4);

    // If there are more than one possible bin select first one
    await p.addRect(5, 5);
    expect(p.length).toBe(2);
    expect(p.rectList().length).toBe(5);
    expect(p.rectList()).toContainEqual([0, 10, 90, 5, 5, null]);
  });
});

describe('PackerOnlineBBF Tests', () => {
  test('bin selection - packs into bin with best fitness', async () => {
    const p = new PackerOnlineBBF(
      GuillotineBafSas,
      false
    );

    p.addBin(10, 10);
    p.addBin(15, 15);
    p.addBin(55, 55);
    p.addBin(50, 50);

    // First rectangle is packed into first bin where it fits
    await p.addRect(50, 30);
    expect(p.length).toBe(1);
    expect(Array.from(p)[0].width).toBe(55);

    // Another bin is opened when it doesn't fit into first one
    await p.addRect(50, 30);
    expect(p.length).toBe(2);
    expect(Array.from(p)[1].width).toBe(50);

    // Rectangle is placed into bin with best fitness, not first where it fits
    await p.addRect(20, 20);
    expect(p.length).toBe(2);
    expect(p.rectList()).toContainEqual([1, 0, 30, 20, 20, null]);
  });
});

describe('Packer Tests', () => {
  test('initialization defaults', async () => {
    // Test rotation is enabled by default
    const p = new PackerBNF( GuillotineBafSas, true );
    p.addBin(100, 10);
    p.addRect(10, 89);
    await p.pack();
    expect(p.rectList()[0]).toEqual([0, 0, 0, 89, 10, null]);

    // Test default packing algo
    const p2 = new PackerBFF();
    p2.addBin(10, 10);
    p2.addRect(1, 1);
    await p2.pack();
    for (const b of p2) {
      expect(b).toBeInstanceOf(GuillotineBssfSas);
    }

    // Test default sorting algo is unsorted
    const p3 = new PackerBFF(
      packAlgo= GuillotineBssfSas,
      rotation= false
    );
    p3.addBin(100, 100, 20);

    p3.addRect(70, 70);
    p3.addRect(90, 55);
    p3.addRect(90, 90);
    p3.addRect(55, 90);
    p3.addRect(60, 60);
    await p3.pack();

    expect(p3.rectList()).toContainEqual([0, 0, 0, 70, 70, null]);
    expect(p3.rectList()).toContainEqual([1, 0, 0, 90, 55, null]);
    expect(p3.rectList()).toContainEqual([2, 0, 0, 90, 90, null]);
    expect(p3.rectList()).toContainEqual([3, 0, 0, 55, 90, null]);
    expect(p3.rectList()).toContainEqual([4, 0, 0, 60, 60, null]);
  });

  test('packing functionality', async () => {
    // Check packing without bins doesn't raise errors
    const p = new PackerBFF();
    p.addRect(10, 10);
    await p.pack();

    expect(p.rectList()).toEqual([]);
    expect(p.binList()).toEqual([]);
    expect(Array.from(p)).toEqual([]);

    // No errors when there are no rectangles to pack
    const p2 = new PackerBFF();
    p2.addBin(10, 10);
    await p2.pack();
    expect(p2.rectList()).toEqual([]);
    expect(p2.binList()).toEqual([]);

    // Test rectangles are packed into first available bin
    const p3 = new PackerBFF(
    //   rotation= false,
      sortAlgo= SORT_NONE
    );
    p3.addBin(20, 10);
    p3.addBin(50, 50);
    p3.addRect(10, 20);
    p3.addRect(41, 41); // Not enough space for this rectangle
    await p3.pack();

    expect(p3.binList().length).toBe(1);
    expect(Array.from(p3)[0].width).toBe(50);
    expect(Array.from(p3)[0].height).toBe(50);
    expect(p3.rectList()[0]).toEqual([0, 0, 0, 10, 20, null]);
  });
});

describe('newPacker Tests', () => {
  test('default options', async () => {
    // Test default options
    const p = newPacker();
    
    // Default mode Online BBF
    expect(p).toBeInstanceOf(PackerBBF);

    // Default rotations true
    expect(p._rotation).toBe(true);

    // Default packing algo
    p.addRect(100, 10);
    p.addBin(10, 100);
    await p.pack();
    for (const b of p) {
      expect(b).toBeInstanceOf(GuillotineBssfSas);
    }

    // Test default sorting algo is SORT_AREA
    const p2 = newPacker({
      packAlgo: GuillotineBssfSas,
      rotation: false
    });
    p2.addBin(100, 100, 20);
   
    p2.addRect(70, 70);
    p2.addRect(90, 55);
    p2.addRect(90, 90);
    p2.addRect(55, 90);
    p2.addRect(60, 60);
    await p2.pack();

    const rectList = p2.rectList();
    expect(rectList.length).toBe(5);
    expect(rectList).toContainEqual([0, 0, 0, 90, 90, null]);
    expect(rectList).toContainEqual([1, 0, 0, 90, 55, null]);
    expect(rectList).toContainEqual([2, 0, 0, 70, 70, null]);
    expect(rectList).toContainEqual([3, 0, 0, 60, 60, null]);
    expect(rectList).toContainEqual([4, 0, 0, 55, 90, null]);
  });

  test('packing modes', () => {
    // Test online mode
    const p1 = newPacker({
      mode: PackingMode.Online,
      binAlgo: PackingBin.BNF
    });
    expect(p1).toBeInstanceOf(PackerOnlineBNF);

    const p2 = newPacker({
      mode: PackingMode.Online,
      binAlgo: PackingBin.BFF
    });
    expect(p2).toBeInstanceOf(PackerOnlineBFF);

    const p3 = newPacker({
      mode: PackingMode.Online,
      binAlgo: PackingBin.BBF
    });
    expect(p3).toBeInstanceOf(PackerOnlineBBF);

    // Test offline mode
    const p4 = newPacker({
      mode: PackingMode.Offline,
      binAlgo: PackingBin.BNF
    });
    expect(p4).toBeInstanceOf(PackerBNF);

    const p5 = newPacker({
      mode: PackingMode.Offline,
      binAlgo: PackingBin.BFF
    });
    expect(p5).toBeInstanceOf(PackerBFF);

    const p6 = newPacker({
      mode: PackingMode.Offline,
      binAlgo: PackingBin.BBF
    });
    expect(p6).toBeInstanceOf(PackerBBF);

    const p7 = newPacker({
      mode: PackingMode.Offline,
      binAlgo: PackingBin.Global
    });
    expect(p7).toBeInstanceOf(PackerGlobal);
  });
});
 
# rectpackbin

Rectangle bin packing for JavaScript. Give it some bins (sheets, pages, textures) and a list of rectangles, and it works out where each rectangle goes so they fit with as little wasted space as possible.

It is a port of the Python [rectpack](https://github.com/secnot/rectpack) library and keeps its API shape: the same packing modes, bin selection strategies, Guillotine and MaxRects algorithms, and sort orders.

Typical uses: laying out print sheets, building sprite sheets and texture atlases, cutting lists for sheet material, and fitting tiles into a fixed area.

- [Install](#install)
- [Quick start](#quick-start)
- [Usage guide](#usage-guide)
- [Options](#options)
- [Algorithms](#algorithms)
- [API reference](#api-reference)
- [Known limitations](#known-limitations)

## Install

```bash
npm install rectpackbin
```

```js
// CommonJS
const { newPacker } = require("rectpackbin");

// ES modules (Node.js)
import { newPacker } from "rectpackbin";
```

For a plain browser page, see [Browser](#browser).

## Quick start

```js
const { newPacker } = require("rectpackbin");

const packer = newPacker();

packer.addBin(100, 100);       // one 100 x 100 bin

packer.addRect(60, 40, "a");   // width, height, id
packer.addRect(40, 60, "b");
packer.addRect(30, 30, "c");
packer.addRect(50, 20, "d");

packer.pack();

for (const [bin, x, y, width, height, id] of packer.rectList()) {
  console.log(`bin ${bin}: ${id} at (${x}, ${y}) size ${width}x${height}`);
}
```

Output:

```
bin 0: a at (0, 0) size 60x40
bin 0: b at (0, 40) size 40x60
bin 0: d at (40, 40) size 20x50
bin 0: c at (60, 0) size 30x30
```

`d` was added as 50 x 20 and placed as 20 x 50: rotation is on by default, so the packer may turn a rectangle 90 degrees when that fits better. The reported width and height are always the placed size.

## Usage guide

### 1. Create a packer

`newPacker(options)` returns a packer. With no options it:

- packs **offline**: you add everything, then call `pack()`
- picks the **best-fitting bin** for each rectangle
- sorts rectangles **largest area first**
- uses the **Guillotine** algorithm
- allows **rotation**

See [Options](#options) for every setting.

### 2. Add bins

```js
packer.addBin(width, height);           // one bin
packer.addBin(width, height, count);    // `count` identical bins
packer.addBin(width, height, Infinity); // as many as needed
```

Bins are used in the order they were added. A new bin is only opened when a rectangle doesn't fit in the bins already open.

### 3. Add rectangles

```js
packer.addRect(width, height, id);
```

`id` is optional (it comes back as `null`), but give each rectangle one so you can match the results back to your own data.

### 4. Pack and read the results

In offline mode, call `pack()` once everything is added, then read the placements:

```js
packer.pack();

packer.rectList();
// [[bin, x, y, width, height, id], ...]

packer.binList();
// [[width, height], ...] for each bin that was actually used
```

- `bin` is the index of the bin, in the order bins were opened.
- `x` and `y` give the rectangle's corner nearest the bin's `(0, 0)` corner.
  - Like rectpack, the algorithms treat `(0, 0)` as the bottom-left with `y` going up.
  - On a canvas or in CSS, where `y` goes down, you can use the numbers as top-left positions. The layout is just mirrored and still valid.

You can also iterate over the bins and the rectangles in each:

```js
for (const bin of packer) {
  console.log(`bin ${bin.width} x ${bin.height}`);
  for (const rect of bin) {
    console.log(rect.rid, rect.x, rect.y, rect.width, rect.height);
  }
}
```

### Several bins

Add a count to `addBin`. Rectangles fill the open bins first, and a new one opens only when needed:

```js
const { newPacker, MaxRectsBssf } = require("rectpackbin");

const packer = newPacker({ packAlgo: MaxRectsBssf });
packer.addBin(50, 50, 3);            // three 50 x 50 sheets
for (let i = 0; i < 6; i++) packer.addRect(30, 20, `r${i}`);
packer.pack();

packer.rectList();
// [
//   [0, 0, 0, 30, 20, "r0"], [0, 30, 0, 20, 30, "r1"], [0, 0, 20, 30, 20, "r2"],
//   [1, 0, 0, 30, 20, "r3"], [1, 30, 0, 20, 30, "r4"], [1, 0, 20, 30, 20, "r5"],
// ]
packer.binList().length; // 2: the third sheet wasn't needed
```

### Rectangles that don't fit

A rectangle that fits in no bin is left out of the results. It doesn't raise an error. Compare your ids with `rectList()` to find what was left over:

```js
const packer = newPacker();
packer.addBin(20, 20);
packer.addRect(10, 10, "fits");
packer.addRect(30, 30, "too-big");
packer.pack();

const placed = new Set(packer.rectList().map((r) => r[5]));
const leftOver = ["fits", "too-big"].filter((id) => !placed.has(id)); // ["too-big"]
```

### Online packing

In online mode each rectangle is placed the moment you add it, in the order you add it. There is no `pack()` step and no sorting. Use it when rectangles arrive one at a time.

```js
const { newPacker, PackingMode, PackingBin } = require("rectpackbin");

const packer = newPacker({ mode: PackingMode.Online, binAlgo: PackingBin.BFF });
packer.addBin(100, 100, 2);

packer.addRect(80, 80, "a"); // { x: 0, y: 0, width: 80, height: 80, rid: "a" } in bin 0
packer.addRect(80, 80, "b"); // placed in bin 1
packer.addRect(80, 80, "c"); // null: no room left
```

`addRect` returns the placed rectangle, or `null` when it can't be placed.

### Choosing the algorithm and sort order

```js
const { newPacker, MaxRectsBssf, SORT_LSIDE } = require("rectpackbin");

const packer = newPacker({
  packAlgo: MaxRectsBssf,  // how rectangles are placed inside a bin
  sortAlgo: SORT_LSIDE,    // order rectangles are packed in (offline only)
});
```

Results depend on your data. When density matters, try a few combinations on real input and keep the one that uses the fewest bins. Good starting points:

- **`MaxRectsBssf` with `SORT_AREA`:** usually the densest.
- **`GuillotineBssfSas` (the default):** every layout can be cut from a sheet with straight edge-to-edge cuts, which matters for real sheet material and guillotine cutters.

### Checking a packing

`packer.validatePacking()` throws if any rectangle overlaps another or sits outside its bin. It's handy in tests.

### Starting over

`packer.reset()` removes all bins and placements.

### Browser

The package ships a prebuilt bundle that sets globals on `window`:

```html
<script src="https://unpkg.com/rectpackbin/dist/rectpackbin.min.js"></script>
<script>
  const packer = newPacker();
  packer.addBin(100, 100);
  packer.addRect(50, 50, "a");
  packer.pack();
  console.log(packer.rectList());
</script>
```

The globals are `newPacker`, `PackingMode`, `PackingBin`, `SORT_AREA`, `GuillotineBssfSas`, `MaxRectsBl`, `MaxRectsBssf`, `MaxRectsBaf` and `MaxRectsBlsf`. With a bundler (Vite, webpack, esbuild), import from `"rectpackbin"` as usual.

## Options

`newPacker({ mode, binAlgo, packAlgo, sortAlgo, rotation })`

| Option | Default | Values |
|---|---|---|
| `mode` | `PackingMode.Offline` | `PackingMode.Offline`: add everything, then `pack()`; rectangles are sorted first. `PackingMode.Online`: each rectangle is placed when added. |
| `binAlgo` | `PackingBin.BBF` | Which open bin gets the next rectangle. `PackingBin.BNF` (Bin Next Fit): only the current bin; when the rectangle doesn't fit, that bin is closed and the next one opened. `PackingBin.BFF` (Bin First Fit): the first open bin it fits in. `PackingBin.BBF` (Bin Best Fit): the open bin where it fits best. |
| `packAlgo` | `GuillotineBssfSas` | How rectangles are placed inside a bin. See [Algorithms](#algorithms). |
| `sortAlgo` | `SORT_AREA` | Order rectangles are packed in (offline only). See [Sort orders](#sort-orders). |
| `rotation` | `true` | Allow rectangles to be rotated 90 degrees. See [Known limitations](#known-limitations). |

## Algorithms

### MaxRects

These track every free rectangle in a bin and pick the best one for each placement. They are usually the densest.

| Name | Places each rectangle where… |
|---|---|
| `MaxRectsBl` | it is lowest, then furthest left (Bottom-Left) |
| `MaxRectsBssf` | the shorter leftover side is smallest (Best Short Side Fit) |
| `MaxRectsBaf` | the leftover area is smallest (Best Area Fit) |
| `MaxRectsBlsf` | the longer leftover side is smallest (Best Long Side Fit) |

### Guillotine

These split the free space with straight cuts, so a layout can always be cut from a sheet with edge-to-edge cuts. Each name joins a **fit rule** and a **split rule**: `Guillotine` + fit + split, for example `GuillotineBafMinas`.

| Fit rule | Chooses the free space where… |
|---|---|
| `Bssf` | the shorter leftover side is smallest (Best Short Side Fit) |
| `Blsf` | the longer leftover side is smallest (Best Long Side Fit) |
| `Baf` | the leftover area is smallest (Best Area Fit) |

| Split rule | Splits the remaining free space… |
|---|---|
| `Sas` | along the shorter axis |
| `Las` | along the longer axis |
| `Slas` | along the shorter leftover axis |
| `Llas` | along the longer leftover axis |
| `Maxas` | to keep the largest free area together |
| `Minas` | to keep the smallest free area together |

That gives 18 combinations, all exported: `GuillotineBssfSas`, `GuillotineBssfLas`, `GuillotineBssfSlas`, `GuillotineBssfLlas`, `GuillotineBssfMaxas` and `GuillotineBssfMinas`, plus the same six for `Blsf` and for `Baf`.

### Sort orders

Offline mode sorts rectangles before packing. All of these sort largest first.

| Name | Sorts by |
|---|---|
| `SORT_AREA` | area (default) |
| `SORT_PERI` | perimeter |
| `SORT_DIFF` | difference between the two sides |
| `SORT_SSIDE` | shorter side, then longer side |
| `SORT_LSIDE` | longer side, then shorter side |
| `SORT_RATIO` | width / height ratio |
| `SORT_NONE` | no sorting: keeps the order rectangles were added |

## API reference

### `newPacker(options?)`

Returns a packer. See [Options](#options).

### Packer methods

| Method | Description |
|---|---|
| `addBin(width, height, count = 1)` | Adds `count` bins of this size. Use `Infinity` for unlimited bins. |
| `addRect(width, height, id?)` | Adds a rectangle. In online mode it is placed immediately, and the method returns the placed rectangle or `null`. |
| `pack()` | Offline mode: packs all added rectangles. |
| `rectList()` | `[[bin, x, y, width, height, id], ...]` for every placed rectangle. |
| `binList()` | `[[width, height], ...]` for every bin used. |
| `validatePacking()` | Throws if any rectangles overlap or fall outside their bin. |
| `reset()` | Removes all bins and rectangles. |
| iteration | `for (const bin of packer)` walks the used bins. Each bin is iterable over its rectangles, which have `x`, `y`, `width`, `height` and `rid`. |

### Other exports

Also exported for advanced use: the packer building blocks behind `newPacker` (`PackerBNFMixin`, `PackerBFFMixin`, `PackerBBFMixin`, `PackerOnline`, `BinFactory`) and the helper `float2dec`. Most code only needs `newPacker`.

## Known limitations

These are gaps in the current port:

- **Skyline isn't ported yet.** The Python library's Skyline algorithms aren't available. Use MaxRects or Guillotine instead.
- **`PackingBin.Global` doesn't work yet.** It currently places nothing. Use `BBF` (the default), `BFF` or `BNF`.
- **MaxRects ignores `rotation: false`.** With a MaxRects algorithm, rectangles may still be rotated. The Guillotine algorithms, including the default, respect the setting.
- **Three Guillotine split rules are the same.** `Slas`, `Llas` and `Maxas` currently split the same way.

## Credits

Ported from [rectpack](https://github.com/secnot/rectpack) by secnot, a Python implementation of the algorithms in Jukka Jylänki's *A Thousand Ways to Pack the Bin*.

Written and maintained by [Diljot Singh](https://www.diljotsingh.com) for a print-layout service that arranges customer artwork on printable sheets.

## License

MIT

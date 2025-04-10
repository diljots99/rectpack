


```js
const { newPacker, PackingMode, PackingBin, SORT_AREA } = require('./packer');

// Create a new packer with default settings (Offline mode, BBF algorithm)
const packer = newPacker();

// Create a packer with custom settings
const customPacker = newPacker({
    mode: PackingMode.Online,
    binAlgo: PackingBin.BFF,
    sortAlgo: SORT_AREA,
    rotation: false
});
```
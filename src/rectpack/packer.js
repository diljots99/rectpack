const { GuillotineBssfSas } = require('./guillotine');

// Helper function to convert float to decimal with specified precision
function float2dec(ft, decimalDigits) {
    return Number(Math.ceil(ft * Math.pow(10, decimalDigits)) / Math.pow(10, decimalDigits));
}

// Sorting algorithms for rectangle lists
const SORT_AREA = (rectList) => [...rectList].sort((a, b) => (b[0] * b[1]) - (a[0] * a[1]));
const SORT_PERI = (rectList) => [...rectList].sort((a, b) => (b[0] + b[1]) - (a[0] + a[1]));
const SORT_DIFF = (rectList) => [...rectList].sort((a, b) => Math.abs(b[0] - b[1]) - Math.abs(a[0] - a[1]));
const SORT_SSIDE = (rectList) => [...rectList].sort((a, b) => {
    const [minA, maxA] = [Math.min(a[0], a[1]), Math.max(a[0], a[1])];
    const [minB, maxB] = [Math.min(b[0], b[1]), Math.max(b[0], b[1])];
    return minB - minA || maxB - maxA;
});
const SORT_LSIDE = (rectList) => [...rectList].sort((a, b) => {
    const [maxA, minA] = [Math.max(a[0], a[1]), Math.min(a[0], a[1])];
    const [maxB, minB] = [Math.max(b[0], b[1]), Math.min(b[0], b[1])];
    return maxB - maxA || minB - minA;
});
const SORT_RATIO = (rectList) => [...rectList].sort((a, b) => (b[0] / b[1]) - (a[0] / a[1]));
const SORT_NONE = (rectList) => [...rectList];

class BinFactory {
    constructor(width, height, count, packAlgo, ...args) {
        this._width = width;
        this._height = height;
        this._count = count;
        this._packAlgo = packAlgo;
        this._algoArgs = args;
        this._refBin = null; // Reference bin used to calculate fitness
    }

    _createBin() {
        return new this._packAlgo(this._width, this._height, ...this._algoArgs);
    }

    isEmpty() {
        return this._count < 1;
    }

    fitness(width, height) {
        if (!this._refBin) {
            this._refBin = this._createBin();
        }
        return this._refBin.fitness(width, height);
    }

    fitsInside(width, height) {
        if (!this._refBin) {
            this._refBin = this._createBin();
        }
        return this._refBin._fitsSurface(width, height);
    }

    newBin() {
        if (this._count > 0) {
            this._count--;
            return this._createBin();
        }
        return null;
    }
}

class PackerBNFMixin {
    async addRect(width, height, rid = null) {
        while (true) {
            if (this._openBins.length === 0) {
                const newBin = await this._newOpenBin(width, height, rid);
                if (!newBin) return null;
            }

            const rect = await this._openBins[0].addRect(width, height, rid);
            if (rect) return rect;

            const closedBin = this._openBins.shift();
            this._closedBins.push(closedBin);
        }
    }
}

class PackerBFFMixin {
    async addRect(width, height, rid = null) {
        for (const bin of this._openBins) {
            const rect = await bin.addRect(width, height, rid);
            if (rect) return rect;
        }

        while (true) {
            const newBin = await this._newOpenBin(width, height, rid);
            if (!newBin) return null;

            const rect = await newBin.addRect(width, height, rid);
            if (rect) return rect;
        }
    }
}

class PackerBBFMixin {
    async addRect(width, height, rid = null) {
        // Try packing into open bins
        const fitBins = this._openBins
            .map(b => [b.fitness(width, height), b])
            .filter(([fitness]) => fitness !== null);

        if (fitBins.length > 0) {
            const [_, bestBin] = fitBins.reduce((min, curr) => 
                curr[0] < min[0] ? curr : min
            );
            return await bestBin.addRect(width, height, rid);
        }

        // Try packing into empty bins
        while (true) {
            const newBin = await this._newOpenBin(width, height, rid);
            if (!newBin) return null;

            if (await newBin.addRect(width, height, rid)) {
                return true;
            }
        }
    }
}

class PackerOnline {
    constructor(packAlgo = GuillotineBssfSas, rotation = true) {
        this._rotation = rotation;
        this._packAlgo = packAlgo;
        this.reset();
    }

    *[Symbol.iterator]() {
        yield* [...this._closedBins, ...this._openBins];
    }

    get length() {
        return this._closedBins.length + this._openBins.length;
    }

    _newOpenBin(width = null, height = null, rid = null) {
        const factoriesToDelete = new Set();
        let newBin = null;

        for (const [key, binFac] of Object.entries(this._emptyBins)) {
            if (!binFac.fitsInside(width, height)) continue;

            newBin = binFac.newBin();
            if (!newBin) continue;

            this._openBins.push(newBin);

            if (binFac.isEmpty()) {
                factoriesToDelete.add(key);
            }
            break;
        }

        factoriesToDelete.forEach(f => delete this._emptyBins[f]);
        return newBin;
    }

    addBin(width, height, count = 1, options = {}) {
        options.rot = this._rotation;
        const binFactory = new BinFactory(width, height, count, this._packAlgo, options);
        this._emptyBins[this._binCount++] = binFactory;
    }

    rectList() {
        const rectangles = [];
        let binCount = 0;

        for (const bin of this) {
            for (const rect of bin) {
                rectangles.push([binCount, rect.x, rect.y, rect.width, rect.height, rect.rid]);
            }
            binCount++;
        }

        return rectangles;
    }

    binList() {
        return [...this].map(b => [b.width, b.height]);
    }

    validatePacking() {
        for (const b of this) {
            b.validatePacking();
        }
    }

    reset() {
        this._closedBins = [];
        this._openBins = [];
        this._emptyBins = new Map();
        this._binCount = 0;
    }
}

// Enum implementation
const PackingMode = {
    Online: 0,
    Offline: 1,
    properties: {
        0: { name: "Online" },
        1: { name: "Offline" }
    }
};

const PackingBin = {
    BNF: 0,    // Bin Next Fit
    BFF: 1,    // Bin First Fit
    BBF: 2,    // Bin Best Fit
    Global: 3,  // Global Fit
    properties: {
        0: { name: "BNF" },
        1: { name: "BFF" },
        2: { name: "BBF" },
        3: { name: "Global" }
    }
};

/**
 * Packer factory helper function
 * @param {PackingMode} mode - Packing mode (Online or Offline)
 * @param {PackingBin} binAlgo - Bin selection heuristic
 * @param {Function} packAlgo - Algorithm used (default: GuillotineBssfSas)
 * @param {Function} sortAlgo - Sorting algorithm (default: SORT_AREA)
 * @param {boolean} rotation - Enable or disable rectangle rotation
 * @returns {Packer} Initialized packer instance
 */
function newPacker({
    mode = PackingMode.Offline,
    binAlgo = PackingBin.BBF,
    packAlgo = GuillotineBssfSas,
    sortAlgo = SORT_AREA,
    rotation = true
} = {}) {
    let packerClass = null;

    // Online Mode
    if (mode === PackingMode.Online) {
        sortAlgo = null;
        switch (binAlgo) {
            case PackingBin.BNF:
                packerClass = PackerOnlineBNF;
                break;
            case PackingBin.BFF:
                packerClass = PackerOnlineBFF;
                break;
            case PackingBin.BBF:
                packerClass = PackerOnlineBBF;
                break;
            default:
                throw new Error("Unsupported bin selection heuristic");
        }
    }
    // Offline Mode
    else if (mode === PackingMode.Offline) {
        switch (binAlgo) {
            case PackingBin.BNF:
                packerClass = PackerBNF;
                break;
            case PackingBin.BFF:
                packerClass = PackerBFF;
                break;
            case PackingBin.BBF:
                packerClass = PackerBBF;
                break;
            case PackingBin.Global:
                packerClass = PackerGlobal;
                sortAlgo = null;
                break;
            default:
                throw new Error("Unsupported bin selection heuristic");
        }
    }
    else {
        throw new Error("Unknown packing mode");
    }

    // Create and return the appropriate packer instance
    if (sortAlgo) {
        return new packerClass({
            packAlgo,
            sortAlgo,
            rotation
        });
    } else {
        return new packerClass({
            packAlgo,
            rotation
        });
    }
}

// Export the classes and sorting functions
module.exports = {
    float2dec,
    SORT_AREA,
    SORT_PERI,
    SORT_DIFF,
    SORT_SSIDE,
    SORT_LSIDE,
    SORT_RATIO,
    SORT_NONE,
    BinFactory,
    PackerBNFMixin,
    PackerBFFMixin,
    PackerBBFMixin,
    PackerOnline,
    PackingMode,
    PackingBin,
    newPacker
};


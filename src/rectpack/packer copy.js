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
                packerClass = PackerBBFStandalone;
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

class Packer extends PackerOnline {
    /**
     * Rectangles aren't packed until pack() is called
     */
    constructor({ packAlgo = GuillotineBssfSas, sortAlgo = SORT_NONE, rotation = true } = {}) {
        super(packAlgo, rotation);
        
        this._sortAlgo = sortAlgo;

        // User provided bins and Rectangles
        this._availBins = [];
        this._availRect = [];

        // Aux vars used during packing
        this._sortedRect = [];
    }

    addBin(width, height, count = 1, options = {}) {
        this._availBins.push([width, height, count, options]);
    }

    addRect(width, height, rid = null) {
        this._availRect.push([width, height, rid]);
    }

    _isEverythingReady() {
        return this._availRect.length > 0 && this._availBins.length > 0;
    }

    async pack() {
        this.reset();

        if (!this._isEverythingReady()) {
            // maybe we should throw an error here?
            return;
        }

        // Add available bins to packer
        for (let i = 0; i < this._availBins.length; i++) {
            const [width, height, count, extraOptions] = this._availBins[i];
            this.addBin(width, height, count, extraOptions);
        }

        // If enabled sort rectangles
        this._sortedRect = this._sortAlgo(this._availRect);

        // Start packing
        for (const r of this._sortedRect) {
            await super.addRect(...r);
        }
    }
}

class PackerBBFMixin extends Packer {
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
class PackerBNF extends Packer {
    /**
     * BNF (Bin Next Fit): Only one open bin, if rectangle doesn't fit
     * go to next bin and close current one.
     */
}

// Apply the mixin
Object.assign(PackerBNF.prototype, PackerBNFMixin.prototype);

class PackerBFF extends Packer {
    /**
     * BFF (Bin First Fit): Pack rectangle in first bin it fits
     */
}

// Apply the mixin
Object.assign(PackerBFF.prototype, PackerBFFMixin.prototype);



class PackerBBF extends PackerBBFMixin {
        /**
         * BBF (Bin Best Fit): Pack rectangle in bin that gives best fitness
         */
    }

    class PackerBBFStandalone {
        constructor({ packAlgo = GuillotineBssfSas, sortAlgo = SORT_NONE, rotation = true } = {}) {
            this._rotation = rotation;
            this._packAlgo = packAlgo;
            this._sortAlgo = sortAlgo;
            
            // User provided bins and Rectangles
            this._availBins = [];
            this._availRect = [];
            
            // Aux vars used during packing
            this._sortedRect = [];
            
            this.reset();
        }
    
        *[Symbol.iterator]() {
            yield* [...this._closedBins, ...this._openBins];
        }
    
        get length() {
            return this._closedBins.length + this._openBins.length;
        }
    
        reset() {
            this._closedBins = [];
            this._openBins = [];
            this._emptyBins = new Map();
            this._binCount = 0;
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
            // For initial bin setup
            this._availBins.push([width, height, count, options]);
            
            // For runtime bin management
            options.rot = this._rotation;
            const binFactory = new BinFactory(width, height, count, this._packAlgo, options);
            this._emptyBins[this._binCount++] = binFactory;
        }
    
        addRect(width, height, rid = null) {
            // For initial rectangle setup
            this._availRect.push([width, height, rid]);
        }
    
        async _addRectRuntime(width, height, rid = null) {
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
    
        _isEverythingReady() {
            return this._availRect.length > 0 && this._availBins.length > 0;
        }
    
        async pack() {
            this.reset();
    
            if (!this._isEverythingReady()) {
                return;
            }
    
            // Add available bins to packer
            const length = this._availBins.length;
            for (let i = 0; i < length; i++) {
                const [width, height, count, extraOptions] = this._availBins[i];
                this.addBin(width, height, count, extraOptions);
            }
    
            // If enabled sort rectangles
            this._sortedRect = this._sortAlgo(this._availRect);
    
            // Start packing
            for (const r of this._sortedRect) {
                await this._addRectRuntime(...r);
            }
        }
    }
// Apply the mixin
// Object.assign(PackerBBF.prototype, PackerBBFMixin.prototype);

class PackerOnlineBNF extends PackerOnline {
    /**
     * BNF Bin Next Fit Online variant
     */
}

// Apply the mixin
Object.assign(PackerOnlineBNF.prototype, PackerBNFMixin.prototype);

class PackerOnlineBFF extends PackerOnline {
    /**
     * BFF Bin First Fit Online variant
     */
}

// Apply the mixin
Object.assign(PackerOnlineBFF.prototype, PackerBFFMixin.prototype);

class PackerOnlineBBF extends PackerOnline {
    /**
     * BBF Bin Best Fit Online variant
     */
}

// Apply the mixin
Object.assign(PackerOnlineBBF.prototype, PackerBBFMixin.prototype);

class PackerGlobal extends Packer {
    /**
     * GLOBAL: For each bin pack the rectangle with the best fitness.
     */
    constructor({ packAlgo = GuillotineBssfSas, rotation = true } = {}) {
        super({ packAlgo, sortAlgo: SORT_NONE, rotation });
    }

    _findBestFit(pbin) {
        /**
         * Return best fitness rectangle from rectangles packing _sortedRect list
         * 
         * @param {PackingAlgorithm} pbin - Packing bin
         * @returns {number|null} key of the rectangle with best fitness
         */
        const fit = Object.entries(this._sortedRect)
            .map(([k, r]) => [pbin.fitness(r[0], r[1]), k])
            .filter(([fitness]) => fitness !== null);

        if (fit.length === 0) return null;

        const [_, rect] = fit.reduce((min, curr) => 
            curr[0] < min[0] ? curr : min
        );
        return rect;
    }

    _newOpenBin(remainingRect) {
        /**
         * Extract the next bin where at least one of the rectangles in
         * remainingRect fits
         * 
         * @param {Object} remainingRect - rectangles not placed yet
         * @returns {PackingAlgorithm|null} Initialized empty packing bin or null if no bin found
         */
        const factoriesToDelete = new Set();
        let newBin = null;

        for (const [key, binFac] of Object.entries(this._emptyBins)) {
            // Only return the new bin if at least one of the remaining 
            // rectangles fit inside.
            let aRectangleFits = false;
            for (const rect of Object.values(remainingRect)) {
                if (binFac.fitsInside(rect[0], rect[1])) {
                    aRectangleFits = true;
                    break;
                }
            }

            if (!aRectangleFits) {
                factoriesToDelete.add(key);
                continue;
            }
           
            // Create bin and add to openBins
            newBin = binFac.newBin();
            if (!newBin) continue;
            this._openBins.push(newBin);

            // If the factory was depleted mark for deletion
            if (binFac.isEmpty()) {
                factoriesToDelete.add(key);
            }
       
            break;
        }

        // Delete marked factories
        for (const f of factoriesToDelete) {
            delete this._emptyBins[f];
        }

        return newBin;
    }

    async pack() {
        this.reset();

        if (!this._isEverythingReady()) {
            return;
        }
        
        // Add available bins to packer
        // for (const b of this._availBins) {
        //     const [width, height, count, extraOptions] = b;
        //     super.addBin(width, height, count, extraOptions);
        // }
    
        // Store rectangles into dict for fast deletion
        this._sortedRect = Object.fromEntries(
            this._sortAlgo(this._availRect).map((r, i) => [i, r])
        );
        
        // For each bin pack the rectangles with lowest fitness until it is filled or
        // the rectangles exhausted, then open the next bin where at least one rectangle 
        // will fit and repeat the process until there aren't more rectangles or bins 
        // available.
        while (Object.keys(this._sortedRect).length > 0) {
            // Find one bin where at least one of the remaining rectangles fit
            const pbin = this._newOpenBin(this._sortedRect);
            if (!pbin) break;

            // Pack as many rectangles as possible into the open bin
            while (true) {
                // Find 'fittest' rectangle
                const bestRectKey = this._findBestFit(pbin);
                if (!bestRectKey) {
                    const closedBin = this._openBins.shift();
                    this._closedBins.push(closedBin);
                    break; // None of the remaining rectangles can be packed in this bin
                }

                const bestRect = this._sortedRect[bestRectKey];
                delete this._sortedRect[bestRectKey];

                await PackerBNFMixin.prototype.addRect.call(this, ...bestRect);
            }
        }
    }

}

// Apply the mixin
Object.assign(PackerGlobal.prototype, PackerBNFMixin.prototype);

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
    Packer,
    PackerBNF,
    PackerBFF,
    PackerBBF,
    PackerOnlineBNF,
    PackerOnlineBFF,
    PackerOnlineBBF,
    PackerGlobal,
    PackingMode,
    PackingBin,
    newPacker
};


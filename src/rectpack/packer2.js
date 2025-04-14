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
        for (const b of this._availBins) {
            const [width, height, count, extraOptions] = b;
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

export { PackerBBF as PackerBBFStandalone };
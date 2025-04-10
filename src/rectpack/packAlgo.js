const { Rectangle } = require('./geometry');

class PackingAlgorithm {
    /**
     * Initialize packing algorithm
     * @param {number} width - Packing surface width
     * @param {number} height - Packing surface height
     * @param {boolean} rot - Rectangle rotation enabled or disabled
     * @param {string|number} bid - Packing surface identification
     */
    constructor(width, height, rot = true, bid = null) {
        this.width = width;
        this.height = height;
        this.rot = rot;
        this.rectangles = [];
        this.bid = bid;
        this._surface = new Rectangle(0, 0, width, height);
        this.reset();
    }

    /**
     * Get the number of rectangles
     * @returns {number}
     */
    get length() {
        return this.rectangles.length;
    }

    /**
     * Make the class iterable
     */
    [Symbol.iterator]() {
        return this.rectangles[Symbol.iterator]();
    }

    /**
     * Test if surface is big enough to place a rectangle
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     * @returns {boolean} - True if it could be placed, False otherwise
     */
    _fitsSurface(width, height) {
        if (!(width > 0 && height > 0)) {
            throw new Error("Width and height must be positive");
        }

        if (this.rot && (width > this.width || height > this.height)) {
            width = height
            height = width
        }

        if (width > this.width || height > this.height) {   
            return false;
        }

        return true;
    }

    /**
     * Return rectangle in selected position
     * @param {number} key - Index of the rectangle
     * @returns {Rectangle}
     */
    getItem(key) {
        return this.rectangles[key];
    }

    /**
     * Total area of rectangles placed
     * @returns {number} - Area
     */
    usedArea() {
        return this.rectangles.reduce((sum, rect) => sum + rect.area(), 0);
    }

    /**
     * Metric used to rate how much space is wasted if a rectangle is placed
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     * @param {boolean} rot - Enable rectangle rotation
     * @returns {number|null} - Rectangle fitness or null if can't be placed
     */
    fitness(width, height, rot = false) {
        throw new Error("Not implemented");
    }

    /**
     * Add rectangle of width x height dimensions
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     * @param {string|number} rid - Optional rectangle user id
     * @returns {Rectangle|null} - Rectangle with placement coordinates or null if couldn't be placed
     */
    addRect(width, height, rid = null) {
        throw new Error("Not implemented");
    }

    /**
     * Returns a list with all rectangles placed into the surface
     * @returns {Array} - Format [[x, y, width, height, rid], ...]
     */
    rectList() {
        return this.rectangles.map(r => [r.x, r.y, r.width, r.height, r.rid]);
    }

    /**
     * Check for collisions between rectangles and validate placement inside surface
     * @throws {Error} If validation fails
     */
    validatePacking() {
        const surface = new Rectangle(0, 0, this.width, this.height);

        // Check if all rectangles are within surface
        for (const rect of this.rectangles) {
            if (!surface.contains(rect)) {
                throw new Error("Rectangle placed outside surface");
            }
        }

        // Check for collisions between rectangles
        if (this.rectangles.length <= 1) {
            return;
        }

        for (let r1 = 0; r1 <= this.rectangles.length - 2; r1++) {

            for (let r2 = r1 + 1; r2 <= this.rectangles.length - 1; r2++) {
                if (this.rectangles[r1].intersects(this.rectangles[r2])) {
                    throw new Error("Rectangle collision detected");
                }
            }
        }
    }

    /**
     * Returns true if there are no rectangles placed
     * @returns {boolean}
     */
    isEmpty() {
        return this.rectangles.length === 0;
    }

    /**
     * Reset the packing algorithm
     */
    reset() {
        this.rectangles = [];
    }
}

module.exports = PackingAlgorithm;



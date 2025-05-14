const { Rectangle } = require('./geometry');
const PackingAlgorithm = require('./packAlgo');

class MaxRects extends PackingAlgorithm {
    /**
     * Implementation of MaxRects packing algorithm
     * For a more detailed explanation of the algorithm used, see:
     * Jukka Jylanki - A Thousand Ways to Pack the Bin (February 27, 2010)
     * @param {number} width - Surface width
     * @param {number} height - Surface height
     * @param {boolean} rot - Enable rotation
     */
    constructor(width, height, rot = true, ...args) {
        super(width, height, rot, ...args);
        this._max_rects = [new Rectangle(0, 0, width, height)];
    }

    /**
     * Calculate fitness for rectangle placement in a maximal rectangle
     * @param {Rectangle} max_rect - Destination maximal rectangle
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     * @returns {number|null} Fitness value or null if placement impossible
     */
    _rect_fitness(max_rect, width, height) {
        if (width <= max_rect.width && height <= max_rect.height) {
            return 0;
        }
        return null;
    }

    /**
     * Find maximal rectangle with best fitness for placing a rectangle
     * @param {number} w - Rectangle width
     * @param {number} h - Rectangle height
     * @returns {[Rectangle, Rectangle]} Placed rectangle and maximal rectangle where it was placed
     */
    _select_position(w, h) {
        if (!this._max_rects.length) {
            return [null, null];
        }

        // Normal rectangle
        let fitn = this._max_rects
            .map(m => {
                const fitness = this._rect_fitness(m, w, h);
                return fitness !== null ? [fitness, w, h, m] : null;
            })
            .filter(x => x !== null);

        // Rotated rectangle
        let fitr = [];
        if (this.rot) {
            fitr = this._max_rects
                .map(m => {
                    const fitness = this._rect_fitness(m, h, w);
                    return fitness !== null ? [fitness, h, w, m] : null;
                })
                .filter(x => x !== null);
        }

        const fit = [...fitn, ...fitr];
        if (fit.length === 0) {
            return [null, null];
        }

        const [_, width, height, m] = fit.reduce((min, curr) => 
            curr[0] < min[0] ? curr : min
        );

        return [new Rectangle(m.x, m.y, width, height), m];
    }

    /**
     * Generate new maximal rectangles after placing a rectangle
     * @param {Rectangle} m - Maximal rectangle
     * @param {Rectangle} r - Placed rectangle
     * @returns {Rectangle[]} New maximal rectangles
     */
    _generate_splits(m, r) {
        const new_rects = [];
        
        if (r.x > m.x) {
            new_rects.push(new Rectangle(m.x, m.y, r.x - m.x, m.height));
        }
        if (r.x + r.width < m.x + m.width) {
            new_rects.push(new Rectangle(r.x + r.width, m.y, (m.x + m.width) - (r.x + r.width), m.height));
        }
        if (r.y + r.height < m.y + m.height) {
            new_rects.push(new Rectangle(m.x, r.y + r.height, m.width, (m.y + m.height) - (r.y + r.height)));
        }
        if (r.y > m.y) {
            new_rects.push(new Rectangle(m.x, m.y, m.width, r.y - m.y));
        }
        
        return new_rects;
    }

    /**
     * Split all maximal rectangles intersecting with the placed rectangle
     * @param {Rectangle} rect - Placed rectangle
     */
    _split(rect) {
        const max_rects = [];

        for (const r of this._max_rects) {
            if (r.intersects(rect)) {
                max_rects.push(...this._generate_splits(r, rect));
            } else {
                max_rects.push(r);
            }
        }

        this._max_rects = max_rects;
    }

    /**
     * Remove maximal rectangles contained by others
     */
    _remove_duplicates() {
        const contained = new Set();
        
        for (let i = 0; i < this._max_rects.length; i++) {
            for (let j = i + 1; j < this._max_rects.length; j++) {
                const m1 = this._max_rects[i];
                const m2 = this._max_rects[j];
                
                if (m1.contains(m2)) {
                    contained.add(m2);
                } else if (m2.contains(m1)) {
                    contained.add(m1);
                }
            }
        }

        this._max_rects = this._max_rects.filter(m => !contained.has(m));
    }

    /**
     * Calculate fitness for given dimensions
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     * @returns {number|null} Fitness value or null if placement impossible
     */
    fitness(width, height) {
        if (!(width > 0 && height > 0)) {
            throw new Error("Width and height must be positive");
        }
        
        const [rect, max_rect] = this._select_position(width, height);
        if (!rect) {
            return null;
        }

        return this._rect_fitness(max_rect, rect.width, rect.height);
    }

    /**
     * Add rectangle of width x height dimensions
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     * @param {string|number} rid - Optional rectangle ID
     * @returns {Rectangle|null} Placed rectangle or null if placement failed
     */
    addRect(width, height, rid = null) {
        if (!(width > 0 && height > 0)) {
            throw new Error("Width and height must be positive");
        }

        const [rect, _] = this._select_position(width, height);
        if (!rect) {
            return null;
        }
        
        this._split(rect);
        this._remove_duplicates();

        rect.rid = rid;
        this.rectangles.push(rect);
        return rect;
    }

    /**
     * Reset the algorithm state
     */
    reset() {
        super.reset();
        this._max_rects = [new Rectangle(0, 0, this.width, this.height)];
    }
}

class MaxRectsBl extends MaxRects {
    /**
     * Select position where the y coordinate of the top of the rectangle is lower
     * @param {number} w - Rectangle width
     * @param {number} h - Rectangle height
     * @returns {[Rectangle, Rectangle]} Placed rectangle and maximal rectangle
     */
    _select_position(w, h) {
        if (!this._max_rects.length) {
            return [null, null];
        }

        let fitn = this._max_rects
            .map(m => {
                const fitness = this._rect_fitness(m, w, h);
                return fitness !== null ? [m.y + h, m.x, w, h, m] : null;
            })
            .filter(x => x !== null);

        let fitr = [];
        if (this.rot) {
            fitr = this._max_rects
                .map(m => {
                    const fitness = this._rect_fitness(m, h, w);
                    return fitness !== null ? [m.y + w, m.x, h, w, m] : null;
                })
                .filter(x => x !== null);
        }

        const fit = [...fitn, ...fitr];
        if (fit.length === 0) {
            return [null, null];
        }

        const [_, __, width, height, m] = fit.reduce((min, curr) => 
            curr[0] < min[0] ? curr : min
        );

        return [new Rectangle(m.x, m.y, width, height), m];
    }
}

class MaxRectsBssf extends MaxRects {
    /**
     * Best Short Side Fit - minimize short leftover side
     * @param {Rectangle} max_rect - Maximal rectangle
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     * @returns {number|null} Fitness value or null if placement impossible
     */
    _rect_fitness(max_rect, width, height) {
        if (width > max_rect.width || height > max_rect.height) {
            return null;
        }
        return Math.min(max_rect.width - width, max_rect.height - height);
    }
}

class MaxRectsBaf extends MaxRects {
    /**
     * Best Area Fit - pick maximal rectangle with smallest area
     * @param {Rectangle} max_rect - Maximal rectangle
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     * @returns {number|null} Fitness value or null if placement impossible
     */
    _rect_fitness(max_rect, width, height) {
        if (width > max_rect.width || height > max_rect.height) {
            return null;
        }
        return (max_rect.width * max_rect.height) - (width * height);
    }
}

class MaxRectsBlsf extends MaxRects {
    /**
     * Best Long Side Fit - minimize long leftover side
     * @param {Rectangle} max_rect - Maximal rectangle
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     * @returns {number|null} Fitness value or null if placement impossible
     */
    _rect_fitness(max_rect, width, height) {
        if (width > max_rect.width || height > max_rect.height) {
            return null;
        }
        return Math.max(max_rect.width - width, max_rect.height - height);
    }
}

module.exports = {
    MaxRects,
    MaxRectsBl,
    MaxRectsBssf,
    MaxRectsBaf,
    MaxRectsBlsf
};
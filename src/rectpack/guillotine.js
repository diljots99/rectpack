const { Rectangle } = require('./geometry');
const PackingAlgorithm = require('./packAlgo');

class Guillotine extends PackingAlgorithm {
    /**
     * Implementation of several variants of Guillotine packing algorithm
     * For a more detailed explanation of the algorithm used, see:
     * Jukka Jylanki - A Thousand Ways to Pack the Bin (February 27, 2010)
     * @param {number} width - Surface width
     * @param {number} height - Surface height
     * @param {boolean} rot - Enable rotation
     * @param {boolean} merge - Enable section merging
     */
    constructor(width, height, rot = true, merge = true, ...args) {
        super(width, height, rot, ...args);
        this._merge = merge;
        this._sections = [];
        this._add_section(new Rectangle(0, 0, width, height,null));
    }

    /**
     * Adds a new section to the free section list
     * If section merge is enabled, tries to join the rectangle with existing sections
     * @param {Rectangle} section - New free section
     */
    _add_section(section) {
        section.rid = 0;
        let plen = 0;

        while (this._merge && this._sections && plen !== this._sections.length) {
            plen = this._sections.length;
            this._sections = this._sections.filter(s => !section.join(s));
        }
        this._sections.push(section);
    }

    /**
     * Performs horizontal split of a section
     * @param {Rectangle} section - Section to split
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     */
    _split_horizontal(section, width, height) {
        if (height < section.height) {
            this._add_section(new Rectangle(
                section.x,
                section.y + height,
                section.width,
                section.height - height
            ));
        }

        if (width < section.width) {
            this._add_section(new Rectangle(
                section.x + width,
                section.y,
                section.width - width,
                height
            ));
        }
    }

    /**
     * Performs vertical split of a section
     * @param {Rectangle} section - Section to split
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     */
    _split_vertical(section, width, height) {
        if (height < section.height) {
            this._add_section(new Rectangle(
                section.x,
                section.y + height,
                width,
                section.height - height
            ));
        }

        if (width < section.width) {
            this._add_section(new Rectangle(
                section.x + width,
                section.y,
                section.width - width,
                section.height
            ));
        }
    }

    /**
     * Abstract method to select best split for a section
     * @param {Rectangle} section - Section to split
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     */
    _split(section, width, height) {
        throw new Error("Not implemented");
    }

    /**
     * Abstract method for section fitness calculation
     * @param {Rectangle} section - Section to evaluate
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     */
    _section_fitness(section, width, height) {
        throw new Error("Not implemented");
    }

    /**
     * Selects the fittest section for placing a rectangle
     * @param {number} w - Rectangle width
     * @param {number} h - Rectangle height
     * @returns {[Rectangle, boolean]} Section and rotation flag
     */
    _select_fittest_section(w, h) {
        const fitn = this._sections
            .map(s => {
                const fitness = this._section_fitness(s, w, h);
                return fitness !== null ? [fitness, s, false] : null;
            })
            .filter(x => x !== null);

        const fitr = this.rot ? this._sections
            .map(s => {
                const fitness = this._section_fitness(s, h, w);
                return fitness !== null ? [fitness, s, true] : null;
            })
            .filter(x => x !== null) : [];

        const fit = [...fitn, ...fitr];
        
        if (fit.length === 0) {
            return [null, null];
        }

        const [_, sec, rot] = fit.reduce((min, curr) => 
            curr[0] < min[0] ? curr : min
        );

        return [sec, rot];
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

        const [section, rotated] = this._select_fittest_section(width, height);
        if (!section) {
            return null;
        }

        if (rotated) {
            [width, height] = [height, width];
        }

        this._sections = this._sections.filter(s => s !== section);
        this._split(section, width, height);

        const rect = new Rectangle(section.x, section.y, width, height, rid);
        this.rectangles.push(rect);
        return rect;
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

        const [section, rotated] = this._select_fittest_section(width, height);
        if (!section) {
            return null;
        }

        return rotated ? 
            this._section_fitness(section, height, width) :
            this._section_fitness(section, width, height);
    }

    /**
     * Reset the algorithm state
     */
    reset() {
        super.reset();
        this._sections = [];
        this._add_section(new Rectangle(0, 0, this.width, this.height));
    }
}

// Implementing the various Guillotine algorithms
class GuillotineBaf extends Guillotine {
    _section_fitness(section, width, height) {
        if (width > section.width || height > section.height) {
            return null;
        }
        return section.area() - width * height;
    }
}

class GuillotineBlsf extends Guillotine {
    _section_fitness(section, width, height) {
        if (width > section.width || height > section.height) {
            return null;
        }
        return Math.max(section.width - width, section.height - height);
    }
}

class GuillotineBssf extends Guillotine {
    _section_fitness(section, width, height) {
        if (width > section.width || height > section.height) {
            return null;
        }
        return Math.min(section.width - width, section.height - height);
    }
}

/**
 * Split the section into two parts, the width is less than the height
 */
class GuillotineSas extends Guillotine {
    _split(section, width, height) {
        if (section.width < section.height) {
            return this._split_horizontal(section, width, height);
        } else {
            return this._split_vertical(section, width, height);
        }
    }
}

/**
 * Split the section into two parts, the width is greater than the height
 */
class GuillotineLas extends Guillotine {
    _split(section, width, height) {
        if (section.width >= section.height) {
            return this._split_horizontal(section, width, height);
        } else {
            return this._split_vertical(section, width, height);
        }
    }
}

/**
 * Split the section into two parts, the width is less than the height
 */
class GuillotineSlas extends Guillotine {
    _split(section, width, height) {
        if (section.width - width < section.height - height) {
            return this._split_horizontal(section, width, height);
        } else {
            return this._split_vertical(section, width, height);
        }
    }
}

/**
 * Split the section into two parts, the width is greater than the height
 */
class GuillotineLlas extends Guillotine {
    _split(section, width, height) {
        if (section.width - width >= section.height - height) {
            return this._split_horizontal(section, width, height);
        } else {
            return this._split_vertical(section, width, height);
        }
    }
}

/**
 * Split the section into two parts, the width is greater than the height
 */
class GuillotineMaxas extends Guillotine {
    _split(section, width, height) {
        if (width * (section.height - height) <= height * (section.width - width)) {
            return this._split_horizontal(section, width, height);
        } else {
            return this._split_vertical(section, width, height);
        }
    }
}

/**
 * Split the section into two parts, the width is greater than the height
 */
class GuillotineMinas extends Guillotine {
    _split(section, width, height) {
        if (width * (section.height - height) >= height * (section.width - width)) {
            return this._split_horizontal(section, width, height);
        } else {
            return this._split_vertical(section, width, height);
        }
    }
}

// Combined Guillotine algorithms
class GuillotineBssfSas extends GuillotineBssf {
    _split(section, width, height) {
        if (section.width - width < section.height - height) {
            return this._split_horizontal(section, width, height);
        } else {
            return this._split_vertical(section, width, height);
        }
    }
}
Object.assign(GuillotineBssfSas.prototype, GuillotineSas.prototype);



class GuillotineBssfLas extends GuillotineBssf {}
Object.assign(GuillotineBssfLas.prototype, GuillotineLas.prototype);

class GuillotineBssfSlas extends GuillotineBssf {}
Object.assign(GuillotineBssfSlas.prototype, GuillotineSlas.prototype);

class GuillotineBssfLlas extends GuillotineBssf {}
Object.assign(GuillotineBssfLlas.prototype, GuillotineLlas.prototype);

class GuillotineBssfMaxas extends GuillotineBssf {}
Object.assign(GuillotineBssfMaxas.prototype, GuillotineMaxas.prototype);

class GuillotineBssfMinas extends GuillotineBssf {}
Object.assign(GuillotineBssfMinas.prototype, GuillotineMinas.prototype);

class GuillotineBlsfSas extends GuillotineBlsf {}
Object.assign(GuillotineBlsfSas.prototype, GuillotineSas.prototype);

class GuillotineBlsfLas extends GuillotineBlsf {}
Object.assign(GuillotineBlsfLas.prototype, GuillotineLas.prototype);

class GuillotineBlsfSlas extends GuillotineBlsf {}
Object.assign(GuillotineBlsfSlas.prototype, GuillotineSlas.prototype);

class GuillotineBlsfLlas extends GuillotineBlsf {}
Object.assign(GuillotineBlsfLlas.prototype, GuillotineLlas.prototype);

class GuillotineBlsfMaxas extends GuillotineBlsf {}
Object.assign(GuillotineBlsfMaxas.prototype, GuillotineMaxas.prototype);

class GuillotineBlsfMinas extends GuillotineBlsf {}
Object.assign(GuillotineBlsfMinas.prototype, GuillotineMinas.prototype);

class GuillotineBafSas extends GuillotineBaf {}
Object.assign(GuillotineBafSas.prototype, GuillotineSas.prototype);

class GuillotineBafLas extends GuillotineBaf {}
Object.assign(GuillotineBafLas.prototype, GuillotineLas.prototype);

class GuillotineBafSlas extends GuillotineBaf {}
Object.assign(GuillotineBafSlas.prototype, GuillotineSlas.prototype);

class GuillotineBafLlas extends GuillotineBaf {}
Object.assign(GuillotineBafLlas.prototype, GuillotineLlas.prototype);

class GuillotineBafMaxas extends GuillotineBaf {}
Object.assign(GuillotineBafMaxas.prototype, GuillotineMaxas.prototype);

class GuillotineBafMinas extends GuillotineBaf {}
Object.assign(GuillotineBafMinas.prototype, GuillotineMinas.prototype);

module.exports = {
    Guillotine,
    GuillotineBaf,
    GuillotineBlsf,
    GuillotineBssf,
    GuillotineSas,
    GuillotineLas,
    GuillotineSlas,
    GuillotineLlas,
    GuillotineMaxas,
    GuillotineMinas,
    GuillotineBssfSas,
    GuillotineBssfLas,
    GuillotineBssfSlas,
    GuillotineBssfLlas,
    GuillotineBssfMaxas,
    GuillotineBssfMinas,
    GuillotineBlsfSas,
    GuillotineBlsfLas,
    GuillotineBlsfSlas,
    GuillotineBlsfLlas,
    GuillotineBlsfMaxas,
    GuillotineBlsfMinas,
    GuillotineBafSas,
    GuillotineBafLas,
    GuillotineBafSlas,
    GuillotineBafLlas,
    GuillotineBafMaxas,
    GuillotineBafMinas
};



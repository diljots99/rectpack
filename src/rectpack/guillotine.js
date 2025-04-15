const { Rectangle } = require('./geometry');
const PackingAlgorithm = require('./packAlgo');


const GuillotineMixin = Base => class extends Base {
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

        let fitr = []
        
        if (this.rot.rot === true) {
            fitr = this._sections
                .map(s => {
                    const fitness = this._section_fitness(s, h, w);
                    return fitness !== null ? [fitness, s, true] : null;
                })
                .filter(x => x !== null) ;
        }

        const fit = [...fitn, ...fitr];
        
        if (fit.length === 0) {
            return [];
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
            let temp = width;
            width = height;
            height = temp;
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

const GuillotineBase = GuillotineMixin(PackingAlgorithm);
class Guillotine extends GuillotineBase {
    constructor(...args) {
        super(...args);
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
const BafMixin = Base => class extends Base {
    constructor(...args) {
        super(...args);
      }
      
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

const BlsfMixin = Base => class extends Base {
    constructor(...args) {
        super(...args);
      }

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

const BssfMixin = Base => class extends Base {
    constructor(...args) {
        super(...args);
      }
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
const SasMixin = Base => class extends Base {
    constructor(...args) {
        super(...args);
      }
    _split(section, width, height) {
        if (section.width < section.height) {
            return this._split_horizontal(section, width, height);
        } else {
            return this._split_vertical(section, width, height);
        }
    }
};

const GuillotineSasBase = SasMixin(Guillotine);
class GuillotineSas extends GuillotineSasBase {
    constructor(...args) {
        super(...args);
    }
}

/**
 * Split the section into two parts, the width is greater than the height
 */
const LasMixin = Base => class extends Base {
    constructor(...args) {
        super(...args);
      }
      _split(section, width, height) {
        if (section.width >= section.height) {
            return this._split_horizontal(section, width, height);
        } else {
            return this._split_vertical(section, width, height);
        }
    }
};

const GuillotineLasBase = LasMixin(Guillotine);
class GuillotineLas extends GuillotineLasBase {
    constructor(...args) {
        super(...args);
    }
}

/**
 * Split the section into two parts, the width is less than the height
 */
const SlasMixin = Base => class extends Base {
    constructor(...args) {
        super(...args);
      }
      _split(section, width, height) {
        if (section.width - width < section.height - height) {
            return this._split_horizontal(section, width, height);
        } else {
            return this._split_vertical(section, width, height);
        }
    }
};

const GuillotineSlasBase = SlasMixin(Guillotine);
class GuillotineSlas extends GuillotineSlasBase {
    constructor(...args) {
        super(...args);
    }
}
/**
 * Split the section into two parts, the width is greater than the height
 */
const LlasMixin = Base => class extends Base {
    constructor(...args) {
        super(...args);
      }
      _split(section, width, height) {
        if (section.width - width < section.height - height) {
            return this._split_horizontal(section, width, height);
        } else {
            return this._split_vertical(section, width, height);
        }
    }
};

const GuillotineLlasBase = LlasMixin(Guillotine);
class GuillotineLlas extends GuillotineLlasBase {
    constructor(...args) {
        super(...args);
    }
}

/**
 * Split the section into two parts, the width is greater than the height
 */
const MaxasMixin = Base => class extends Base {
    constructor(...args) {
        super(...args);
      }
      _split(section, width, height) {
        if (section.width - width < section.height - height) {
            return this._split_horizontal(section, width, height);
        } else {
            return this._split_vertical(section, width, height);
        }
    }
};

const GuillotineMaxasBase = MaxasMixin(Guillotine);
class GuillotineMaxas extends GuillotineMaxasBase {
    constructor(...args) {
        super(...args);
    }
}
/**
 * Split the section into two parts, the width is greater than the height
 */

const MinasMixin = Base => class extends Base {
    constructor(...args) {
        super(...args);
      }
      _split(section, width, height) {
        if (width * (section.height - height) >= height * (section.width - width)) {
            return this._split_horizontal(section, width, height);
        } else {
            return this._split_vertical(section, width, height);
        }
    }
};

const GuillotineMinasBase = MinasMixin(Guillotine);
class GuillotineMinas extends GuillotineMinasBase {
    constructor(...args) {
        super(...args);
    }
}

// Combined Guillotine algorithms

const GuillotineBssfSasBase = SasMixin(BssfMixin(Guillotine));

class GuillotineBssfSas extends GuillotineBssfSasBase {
    constructor(...args) {
        super(...args); // 🔑 this forwards the argument!
        
      }
  
    // Optionally override or combine behaviors here
  }



const GuillotineBssfLasBase = LasMixin(BssfMixin(Guillotine));

class GuillotineBssfLas extends GuillotineBssfLasBase {
    constructor(...args) {
        super(...args); // 🔑 this forwards the argument!
        
      }
}

const GuillotineBssfSlasBase = SlasMixin(BssfMixin(Guillotine));

class GuillotineBssfSlas extends GuillotineBssfSlasBase {
    constructor(...args) {
        super(...args); // 🔑 this forwards the argument!
        
      }
}

const GuillotineBssfLlasBase = LlasMixin(BssfMixin(Guillotine));

class GuillotineBssfLlas extends GuillotineBssfLlasBase {
    constructor(...args) {
        super(...args); // 🔑 this forwards the argument!
        
      }
}

const GuillotineBssfMaxasBase = MaxasMixin(BssfMixin(Guillotine));

class GuillotineBssfMaxas extends GuillotineBssfMaxasBase {
    constructor(...args) {
        super(...args); // 🔑 this forwards the argument!
        
      }
}

const GuillotineBssfMinasBase = MinasMixin(BssfMixin(Guillotine));

class GuillotineBssfMinas extends GuillotineBssfMinasBase {
    constructor(...args) {
        super(...args); // 🔑 this forwards the argument!
        
      }
}

const GuillotineBlsfSasBase = SasMixin(BlsfMixin(Guillotine));

class GuillotineBlsfSas extends GuillotineBlsfSasBase {
    constructor(...args) {
        super(...args); // 🔑 this forwards the argument!
        
      }
}

const GuillotineBlsfLasBase = LasMixin(BlsfMixin(Guillotine));

class GuillotineBlsfLas extends GuillotineBlsfLasBase {
    constructor(...args) {
        super(...args); // 🔑 this forwards the argument!
        
      }
}

const GuillotineBlsfSlasBase = SlasMixin(BlsfMixin(Guillotine));

class GuillotineBlsfSlas extends GuillotineBlsfSlasBase {
    constructor(...args) {
        super(...args); // 🔑 this forwards the argument!
        
      }
}


const GuillotineBlsfLlasBase = LlasMixin(BlsfMixin(Guillotine));

class GuillotineBlsfLlas extends GuillotineBlsfLlasBase {
    constructor(...args) {
        super(...args); // 🔑 this forwards the argument!
        
      }
}

const GuillotineBlsfMaxasBase = MaxasMixin(BlsfMixin(Guillotine));

class GuillotineBlsfMaxas extends GuillotineBlsfMaxasBase {
    constructor(...args) {
        super(...args); // 🔑 this forwards the argument!
        
      }
}

const GuillotineBlsfMinasBase = MinasMixin(BlsfMixin(Guillotine));

class GuillotineBlsfMinas extends GuillotineBlsfMinasBase {
    constructor(...args) {
        super(...args); // 🔑 this forwards the argument!
        
      }
}

const GuillotineBafSasBase = SasMixin(BafMixin(Guillotine));

class GuillotineBafSas extends GuillotineBafSasBase {
    constructor(...args) {
        super(...args); // 🔑 this forwards the argument!
        
      }
}

const GuillotineBafLasBase = LasMixin(BafMixin(Guillotine));

class GuillotineBafLas extends GuillotineBafLasBase {
    constructor(...args) {
        super(...args); // 🔑 this forwards the argument!
        
      }
}

const GuillotineBafSlasBase = SlasMixin(BafMixin(Guillotine));

class GuillotineBafSlas extends GuillotineBafSlasBase {
    constructor(...args) {
        super(...args); // 🔑 this forwards the argument!
        
      }
}


const GuillotineBafLlasBase = LlasMixin(BafMixin(Guillotine));

class GuillotineBafLlas extends GuillotineBafLlasBase {
    constructor(...args) {
        super(...args); // 🔑 this forwards the argument!
        
      }
}

const GuillotineBafMaxasBase = MaxasMixin(BafMixin(Guillotine));

class GuillotineBafMaxas extends GuillotineBafMaxasBase {
    constructor(...args) {
        super(...args); // 🔑 this forwards the argument!
        
      }
}

const GuillotineBafMinasBase = MinasMixin(BafMixin(Guillotine));

class GuillotineBafMinas extends GuillotineBafMinasBase {
    constructor(...args) {
        super(...args); // 🔑 this forwards the argument!
        
      }
}

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



// const { Rectangle } = require('./geometry');
// const { Point, HSegment } = require('./geometry');
// const PackingAlgorithm = require('./packAlgo');
// const WasteManager = require('./waste');

// // Base Skyline mixin
// const SkylineMixin = Base => class extends Base {
//     /**
//      * Initialize Skyline algorithm
//      * @param {number} width - Surface width
//      * @param {number} height - Surface height
//      * @param {boolean} rot - Rectangle rotation enabled
//      */
//     constructor(width, height, rot = true, ...args) {
//         super(width, height, rot, false, ...args);
//         this._waste_management = false;
//         this._waste = new WasteManager(rot);
//         this._skyline = [new HSegment(new Point(0, 0), width)];
//     }

//     _placement_points_generator(skyline, width) {
//         const skyline_r = skyline[skyline.length - 1].right;
//         const skyline_l = skyline[0].left;

//         // Placements using skyline segment left point
//         const ppointsl = skyline
//             .filter(s => s.left + width <= skyline_r)
//             .map(s => s.left);

//         // Placements using skyline segment right point
//         const ppointsr = skyline
//             .filter(s => s.right - width >= skyline_l)
//             .map(s => s.right - width);

//         // Merge and sort positions
//         return [...ppointsl, ...ppointsr].sort((a, b) => a - b);
//     }

//     _generate_placements(width, height) {
//         const skyline = this._skyline;
//         const points = [];

//         let left_index = 0;
//         let right_index = 0;
//         let support_height = skyline[0].top;
//         let support_index = 0;

//         const placements = this._placement_points_generator(skyline, width);
        
//         for (const p of placements) {
//             // If Rectangle's right side changed segment, find new support
//             if (p + width > skyline[right_index].right) {
//                 for (right_index = right_index + 1; right_index < skyline.length; right_index++) {
//                     if (skyline[right_index].top >= support_height) {
//                         support_index = right_index;
//                         support_height = skyline[right_index].top;
//                     }
//                     if (p + width <= skyline[right_index].right) {
//                         break;
//                     }
//                 }
//             }

//             // If left side changed segment
//             if (p >= skyline[left_index].right) {
//                 left_index++;
//             }

//             // Find new support if the previous one was shifted out
//             if (support_index < left_index) {
//                 support_index = left_index;
//                 support_height = skyline[left_index].top;
//                 for (let i = left_index; i <= right_index; i++) {
//                     if (skyline[i].top >= support_height) {
//                         support_index = i;
//                         support_height = skyline[i].top;
//                     }
//                 }
//             }

//             // Add point if there is enough room at the top
//             if (support_height + height <= this.height) {
//                 points.push([
//                     new Rectangle(p, support_height, width, height),
//                     left_index,
//                     right_index
//                 ]);
//             }
//         }

//         return points;
//     }

//     _merge_skyline(skylineq, segment) {
//         if (skylineq.length === 0) {
//             skylineq.push(segment);
//             return;
//         }

//         if (skylineq[skylineq.length - 1].top === segment.top) {
//             const s = skylineq[skylineq.length - 1];
//             skylineq[skylineq.length - 1] = new HSegment(s.start, s.length + segment.length);
//         } else {
//             skylineq.push(segment);
//         }
//     }

//     _add_skyline(rect) {
//         const skylineq = []; // Skyline after adding new one

//         for (const sky of this._skyline) {
//             if (sky.right <= rect.left || sky.left >= rect.right) {
//                 this._merge_skyline(skylineq, sky);
//                 continue;
//             }

//             if (sky.left < rect.left && sky.right > rect.left) {
//                 // Skyline section partially under segment left
//                 this._merge_skyline(skylineq, 
//                     new HSegment(sky.start, rect.left - sky.left));
//                 sky = new HSegment(new Point(rect.left, sky.top), sky.right - rect.left);
//             }

//             if (sky.left < rect.right) {
//                 if (sky.left === rect.left) {
//                     this._merge_skyline(skylineq,
//                         new HSegment(new Point(rect.left, rect.top), rect.width));
//                 }
//                 // Skyline section partially under segment right
//                 if (sky.right > rect.right) {
//                     this._merge_skyline(skylineq,
//                         new HSegment(new Point(rect.right, sky.top), sky.right - rect.right));
//                     sky = new HSegment(sky.start, rect.right - sky.left);
//                 }
//             }

//             if (sky.left >= rect.left && sky.right <= rect.right) {
//                 // Skyline section fully under segment, account for wasted space
//                 if (this._waste_management && sky.top < rect.bottom) {
//                     this._waste.addWaste(sky.left, sky.top,
//                         sky.length, rect.bottom - sky.top);
//                 }
//             } else {
//                 // Segment
//                 this._merge_skyline(skylineq, sky);
//             }
//         }

//         this._skyline = skylineq;
//     }

//     _rect_fitness(rect, left_index, right_index) {
//         return rect.top;
//     }

//     _select_position(width, height) {
//         const positions = this._generate_placements(width, height);
//         if (this.rot && width !== height) {
//             positions.push(...this._generate_placements(height, width));
//         }
//         if (positions.length === 0) {
//             return [null, null];
//         }

//         return positions.reduce((min, curr) => {
//             const fitness = this._rect_fitness(curr[0], curr[1], curr[2]);
//             return (!min[1] || fitness < min[1]) ? [curr[0], fitness] : min;
//         }, [null, null]);
//     }

//     fitness(width, height) {
//         if (!(width > 0 && height > 0)) {
//             throw new Error("Width and height must be positive");
//         }
        
//         if (width > Math.max(this.width, this.height) ||
//             height > Math.max(this.height, this.width)) {
//             return null;
//         }

//         // If there is room in wasted space, FREE PACKING!!
//         if (this._waste_management) {
//             if (this._waste.fitness(width, height) !== null) {
//                 return 0;
//             }
//         }

//         // Get best fitness segment
//         const [_, fitness] = this._select_position(width, height);
//         return fitness;
//     }

//     addRect(width, height, rid = null) {
//         if (!(width > 0 && height > 0)) {
//             throw new Error("Width and height must be positive");
//         }

//         if (width > Math.max(this.width, this.height) ||
//             height > Math.max(this.height, this.width)) {
//             return null;
//         }

//         let rect = null;
//         // If Waste management is enabled, first try to place the rectangle there
//         if (this._waste_management) {
//             rect = this._waste.addRect(width, height, rid);
//         }

//         // Get best possible rectangle position
//         if (!rect) {
//             const [selectedRect] = this._select_position(width, height);
//             if (selectedRect) {
//                 rect = selectedRect;
//                 this._add_skyline(rect);
//             }
//         }

//         if (rect === null) {
//             return null;
//         }

//         // Store rectangle
//         rect.rid = rid;
//         this.rectangles.push(rect);
//         return rect;
//     }

//     reset() {
//         super.reset();
//         this._skyline = [new HSegment(new Point(0, 0), this.width)];
//         this._waste.reset();
//     }
// };

// // Waste Management Mixin
// const WasteMixin = Base => class extends Base {
//     constructor(width, height, ...args) {
//         super(width, height, ...args);
//         this._waste_management = true;
//     }
// };

// // Min Waste Fit Mixin
// const MwfMixin = Base => class extends Base {
//     _rect_fitness(rect, left_index, right_index) {
//         let waste = 0;
//         for (let i = left_index; i <= right_index; i++) {
//             const seg = this._skyline[i];
//             waste += (Math.min(rect.right, seg.right) - Math.max(rect.left, seg.left)) *
//                     (rect.bottom - seg.top);
//         }
//         return waste;
//     }
// };

// // Min Waste Fit Low Profile Mixin
// const MwflMixin = Base => class extends Base {
//     _rect_fitness(rect, left_index, right_index) {
//         let waste = 0;
//         for (let i = left_index; i <= right_index; i++) {
//             const seg = this._skyline[i];
//             waste += (Math.min(rect.right, seg.right) - Math.max(rect.left, seg.left)) *
//                     (rect.bottom - seg.top);
//         }
//         return waste * this.width * this.height + rect.top;
//     }
// };

// // Bottom Left Mixin
// const BlMixin = Base => class extends Base {
//     _rect_fitness(rect, left_index, right_index) {
//         return rect.top;
//     }
// };

// // Create base Skyline class
// const SkylineBase = SkylineMixin(PackingAlgorithm);
// class Skyline extends SkylineBase {
//     constructor(...args) {
//         super(...args);
//     }
// }

// // Create individual algorithm classes
// class SkylineBl extends SkylineBase {
//     constructor(...args) {
//         super(...args);
//     }

//     _rect_fitness(rect, left_index, right_index) {
//         return rect.top;
//     }
// }

// class SkylineMwf extends SkylineBase {
//     constructor(...args) {
//         super(...args);
//     }

//     _rect_fitness(rect, left_index, right_index) {
//         let waste = 0;
//         for (let i = left_index; i <= right_index; i++) {
//             const seg = this._skyline[i];
//             waste += (Math.min(rect.right, seg.right) - Math.max(rect.left, seg.left)) *
//                     (rect.bottom - seg.top);
//         }
//         return waste;
//     }

//     _rect_fitness2(rect, left_index, right_index) {
//         return this._skyline
//             .slice(left_index, right_index + 1)
//             .reduce((waste, seg) => 
//                 waste + (Math.min(rect.right, seg.right) - Math.max(rect.left, seg.left)), 0);
//     }
// }

// class SkylineMwfl extends SkylineBase {
//     constructor(...args) {
//         super(...args);
//     }

//     _rect_fitness(rect, left_index, right_index) {
//         let waste = 0;
//         for (let i = left_index; i <= right_index; i++) {
//             const seg = this._skyline[i];
//             waste += (Math.min(rect.right, seg.right) - Math.max(rect.left, seg.left)) *
//                     (rect.bottom - seg.top);
//         }
//         return waste * this.width * this.height + rect.top;
//     }
// }

// // Create combined classes with waste management
// const SkylineBlWmBase = WasteMixin(SkylineBl);
// class SkylineBlWm extends SkylineBlWmBase {
//     constructor(...args) {
//         super(...args);
//     }
// }

// const SkylineMwfWmBase = WasteMixin(SkylineMwf);
// class SkylineMwfWm extends SkylineMwfWmBase {
//     constructor(...args) {
//         super(...args);
//     }
// }

// const SkylineMwflWmBase = WasteMixin(SkylineMwfl);
// class SkylineMwflWm extends SkylineMwflWmBase {
//     constructor(...args) {
//         super(...args);
//     }
// }

// module.exports = {
//     Skyline,
//     SkylineBl,
//     SkylineBlWm,
//     SkylineMwf,
//     SkylineMwfl,
//     SkylineMwfWm,
//     SkylineMwflWm
// };
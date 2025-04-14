
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    equals(other) {
        return (this.x === other.x && this.y === other.y);
    }

    toString() {
        return `P(${this.x}, ${this.y})`;
    }

    distance(point) {
        return Math.sqrt((this.x - point.x) ** 2 + (this.y - point.y) ** 2);
    }

    distanceSquared(point) {
        return (this.x - point.x) ** 2 + (this.y - point.y) ** 2;
    }
}

class Segment {
    constructor(start, end) {
        if (!(start instanceof Point) || !(end instanceof Point)) {
            throw new Error("Start and end must be Point instances");
        }
        this.start = start;
        this.end = end;
    }

    equals(other) {
        if (!(other instanceof Segment)) {
            return false;
        }
        return this.start.equals(other.start) && this.end.equals(other.end);
    }

    toString() {
        return `S(${this.start}, ${this.end})`;
    }

    get lengthSquared() {
        return this.start.distanceSquared(this.end);
    }

    get length() {
        return this.start.distance(this.end);
    }

    get top() {
        return Math.max(this.start.y, this.end.y);
    }

    get bottom() {
        return Math.min(this.start.y, this.end.y);
    }

    get right() {
        return Math.max(this.start.x, this.end.x);
    }

    get left() {
        return Math.min(this.start.x, this.end.x);
    }
}

class HSegment extends Segment {
    constructor(start, length) {
        if (!(start instanceof Point) || typeof length !== 'number') {
            throw new Error("Start must be a Point and length must be a number");
        }
        super(start, new Point(start.x + length, start.y));
    }

    get length() {
        return this.end.x - this.start.x;
    }
}

class VSegment extends Segment {
    constructor(start, length) {
        if (!(start instanceof Point) || typeof length !== 'number') {
            throw new Error("Start must be a Point and length must be a number");
        }
        super(start, new Point(start.x, start.y + length));
    }

    get length() {
        return this.end.y - this.start.y;
    }
}

class Rectangle {
    constructor(x, y, width, height, rid = null) {
        if (height < 0 || width < 0) {
            throw new Error("Height and width must be non-negative");
        }
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.rid = rid;
    }

    get bottom() {
        return this.y;
    }

    get top() {
        return this.y + this.height;
    }

    get left() {
        return this.x;
    }

    get right() {
        return this.x + this.width;
    }

    get cornerTopL() {
        return new Point(this.left, this.top);
    }

    get cornerTopR() {
        return new Point(this.right, this.top);
    }

    get cornerBotR() {
        return new Point(this.right, this.bottom);
    }

    get cornerBotL() {
        return new Point(this.left, this.bottom);
    }

    area() {
        return this.width * this.height;
    }

    move(x, y) {
        this.x = x;
        this.y = y;
    }

    contains(rect) {
        return (rect.y >= this.y &&
                rect.x >= this.x &&
                rect.y + rect.height <= this.y + this.height &&
                rect.x + rect.width <= this.x + this.width);
    }

    intersects(rect, edges = false) {
        if (edges) {
            if (this.bottom > rect.top || this.top < rect.bottom ||
                this.left > rect.right || this.right < rect.left) {
                return false;
            }
        } else {
            if (this.bottom >= rect.top || this.top <= rect.bottom ||
                this.left >= rect.right || this.right <= rect.left) {
                return false;
            }
        }
        return true;
    }

    intersection(rect, edges = false) {
        if (!this.intersects(rect, edges)) {
            return null;
        }

        const bottom = Math.max(this.bottom, rect.bottom);
        const left = Math.max(this.left, rect.left);
        const top = Math.min(this.top, rect.top);
        const right = Math.min(this.right, rect.right);

        return new Rectangle(left, bottom, right - left, top - bottom);
    }

    join(other) {
        if (this.contains(other)) {
            return true;
        }

        if (other.contains(this)) {
            this.x = other.x;
            this.y = other.y;
            this.width = other.width;
            this.height = other.height;
            return true;
        }

        if (!this.intersects(other, true)) {
            return false;
        }

        // Other rectangle is Up/Down from this
        if (this.left === other.left && this.width === other.width) {
            const yMin = Math.min(this.bottom, other.bottom);
            const yMax = Math.max(this.top, other.top);
            this.y = yMin;
            this.height = yMax - yMin;
            return true;
        }

        // Other rectangle is Right/Left from this
        if (this.bottom === other.bottom && this.height === other.height) {
            const xMin = Math.min(this.left, other.left);
            const xMax = Math.max(this.right, other.right);
            this.x = xMin;
            this.width = xMax - xMin;
            return true;
        }

        return false;
    }
}

// Export the classes
module.exports = { Point, Segment, HSegment, VSegment, Rectangle };

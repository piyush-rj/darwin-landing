export type Point = [x: number, y: number];
export type Random = () => number;

export type Tone = "ink" | "line" | "soft" | "hatch" | "shade" | "dark" | "grain";

export type Stroke = { tone: Tone; d: string };

export type Drawing = { fill?: string; tint?: string; texture?: string; strokes: Stroke[] };

const round = (value: number) => Math.round(value * 10) / 10;

export const between = (random: Random, min: number, max: number) => min + random() * (max - min);

export function toPath(points: Point[], closed = false) {
    if (points.length === 0) return "";
    const [first, ...rest] = points;
    const body = rest.map(([x, y]) => `L${round(x)} ${round(y)}`).join("");
    return `M${round(first[0])} ${round(first[1])}${body}${closed ? "Z" : ""}`;
}

export function catmullRom(points: Point[], closed: boolean, samples = 6): Point[] {
    const count = points.length;
    if (count < 3) return points;
    const at = (index: number) =>
        closed ? points[(index + count) % count] : points[Math.min(Math.max(index, 0), count - 1)];
    const segments = closed ? count : count - 1;
    const curve: Point[] = [];
    for (let index = 0; index < segments; index++) {
        const [p0, p1, p2, p3] = [at(index - 1), at(index), at(index + 1), at(index + 2)];
        for (let step = 0; step < samples; step++) {
            const t = step / samples;
            const t2 = t * t;
            const t3 = t2 * t;
            const blend = (a: number, b: number, c: number, d: number) =>
                0.5 *
                (2 * b +
                    (-a + c) * t +
                    (2 * a - 5 * b + 4 * c - d) * t2 +
                    (-a + 3 * b - 3 * c + d) * t3);
            curve.push([blend(p0[0], p1[0], p2[0], p3[0]), blend(p0[1], p1[1], p2[1], p3[1])]);
        }
    }
    if (!closed) curve.push(points[count - 1]);
    return curve;
}

function resample(points: Point[], spacing: number): Point[] {
    const result: Point[] = [points[0]];
    for (let index = 1; index < points.length; index++) {
        const [ax, ay] = points[index - 1];
        const [bx, by] = points[index];
        const pieces = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / spacing));
        for (let piece = 1; piece <= pieces; piece++) {
            const t = piece / pieces;
            result.push([ax + (bx - ax) * t, ay + (by - ay) * t]);
        }
    }
    return result;
}

export function wobble(points: Point[], random: Random, amplitude: number, spacing = 10) {
    const dense = resample(points, spacing);
    const phaseA = random() * Math.PI * 2;
    const phaseB = random() * Math.PI * 2;
    const frequency = between(random, 0.15, 0.35);
    return dense.map(([x, y], index, all): Point => {
        const [px, py] = all[Math.max(index - 1, 0)];
        const [nx, ny] = all[Math.min(index + 1, all.length - 1)];
        const length = Math.hypot(nx - px, ny - py) || 1;
        const normalX = -(ny - py) / length;
        const normalY = (nx - px) / length;
        const offset =
            amplitude *
            (0.6 * Math.sin(index * frequency + phaseA) +
                0.4 * Math.sin(index * frequency * 2.3 + phaseB) +
                0.35 * (random() - 0.5));
        return [x + normalX * offset, y + normalY * offset];
    });
}

function extendEnds(points: Point[], random: Random, reach: number): Point[] {
    if (points.length < 2) return points;
    const stretch = (from: Point, toward: Point, amount: number): Point => {
        const length = Math.hypot(from[0] - toward[0], from[1] - toward[1]) || 1;
        return [
            from[0] + ((from[0] - toward[0]) / length) * amount,
            from[1] + ((from[1] - toward[1]) / length) * amount,
        ];
    };
    const last = points.length - 1;
    return [
        stretch(points[0], points[1], between(random, -reach * 0.4, reach)),
        ...points.slice(1, last),
        stretch(points[last], points[last - 1], between(random, -reach * 0.4, reach)),
    ];
}

export function pencilLine(
    points: Point[],
    random: Random,
    { passes = 2, amplitude = 1.1, closed = false, smooth = false, reach = 4 } = {},
) {
    const base = smooth ? catmullRom(points, closed) : closed ? [...points, points[0]] : points;
    return Array.from({ length: passes }, (_, pass) => {
        const shaped = pass === 0 ? base : extendEnds(base, random, reach);
        return toPath(wobble(shaped, random, amplitude * (pass === 0 ? 1 : 1.6)));
    }).join("");
}

export function shapeOutline(points: Point[], smooth: boolean) {
    return smooth ? catmullRom(points, true) : points;
}

export function pointInPolygon([x, y]: Point, polygon: Point[]) {
    let inside = false;
    for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
        const [xi, yi] = polygon[index];
        const [xj, yj] = polygon[previous];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
}

function bounds(polygon: Point[]) {
    const xs = polygon.map(([x]) => x);
    const ys = polygon.map(([, y]) => y);
    return {
        minX: Math.min(...xs),
        maxX: Math.max(...xs),
        minY: Math.min(...ys),
        maxY: Math.max(...ys),
    };
}

export function hatch(
    polygon: Point[],
    random: Random,
    { angle = 45, spacing = 5, gap = 0.1, trim = 2, bend = 0.8 } = {},
) {
    const radians = (angle * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const rotate = ([x, y]: Point): Point => [x * cos + y * sin, -x * sin + y * cos];
    const unrotate = ([x, y]: Point): Point => [x * cos - y * sin, x * sin + y * cos];
    const turned = polygon.map(rotate);
    const { minY, maxY } = bounds(turned);
    const lines: string[] = [];
    for (let y = minY + spacing * random(); y < maxY; y += spacing * between(random, 0.75, 1.25)) {
        const crossings: number[] = [];
        for (let index = 0; index < turned.length; index++) {
            const [ax, ay] = turned[index];
            const [bx, by] = turned[(index + 1) % turned.length];
            if (ay > y !== by > y) crossings.push(ax + ((y - ay) / (by - ay)) * (bx - ax));
        }
        crossings.sort((a, b) => a - b);
        for (let index = 0; index + 1 < crossings.length; index += 2) {
            if (random() < gap) continue;
            const start = crossings[index] + between(random, 0, trim);
            const end = crossings[index + 1] - between(random, 0, trim);
            if (end - start < 3) continue;
            const middle = (start + end) / 2;
            const sag = between(random, -bend, bend);
            const from = unrotate([start, y + between(random, -0.6, 0.6)]);
            const via = unrotate([middle, y + sag]);
            const to = unrotate([end, y + between(random, -0.6, 0.6)]);
            lines.push(
                `M${round(from[0])} ${round(from[1])}Q${round(via[0])} ${round(via[1])} ${round(to[0])} ${round(to[1])}`,
            );
        }
    }
    return lines.join("");
}

export function scatterInside(polygon: Point[], random: Random, count: number): Point[] {
    const { minX, maxX, minY, maxY } = bounds(polygon);
    const found: Point[] = [];
    for (let attempt = 0; found.length < count && attempt < count * 8; attempt++) {
        const candidate: Point = [between(random, minX, maxX), between(random, minY, maxY)];
        if (pointInPolygon(candidate, polygon)) found.push(candidate);
    }
    return found;
}

export function grain(polygon: Point[], random: Random, { density = 1, size = 5 } = {}) {
    const { minX, maxX, minY, maxY } = bounds(polygon);
    const count = Math.round(((maxX - minX) * (maxY - minY) * density) / 220);
    return scatterInside(polygon, random, count)
        .map(([x, y]) => {
            const angle = random() * Math.PI * 2;
            const length = size * between(random, 0.4, 1.2);
            const ex = x + Math.cos(angle) * length;
            const ey = y + Math.sin(angle) * length;
            const cx = (x + ex) / 2 + between(random, -size, size) * 0.5;
            const cy = (y + ey) / 2 + between(random, -size, size) * 0.5;
            return `M${round(x)} ${round(y)}Q${round(cx)} ${round(cy)} ${round(ex)} ${round(ey)}`;
        })
        .join("");
}

export function crack(
    start: Point,
    random: Random,
    { steps = 4, length = 14, heading = 1.2 } = {},
) {
    const points: Point[] = [start];
    let direction = heading + between(random, -0.6, 0.6);
    for (let step = 0; step < steps; step++) {
        direction += between(random, -0.7, 0.7);
        const [x, y] = points[points.length - 1];
        const reach = length * between(random, 0.5, 1.1);
        points.push([x + Math.cos(direction) * reach, y + Math.sin(direction) * reach]);
    }
    return toPath(points);
}

export function offsetPolygon(polygon: Point[], dx: number, dy: number): Point[] {
    return polygon.map(([x, y]) => [x + dx, y + dy]);
}

export function lerp(a: Point, b: Point, t: number): Point {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

export function band(from: Point, to: Point, width: number, endWidth = width): Point[] {
    const length = Math.hypot(to[0] - from[0], to[1] - from[1]) || 1;
    const nx = -(to[1] - from[1]) / length;
    const ny = (to[0] - from[0]) / length;
    return [
        [from[0] + (nx * width) / 2, from[1] + (ny * width) / 2],
        [to[0] + (nx * endWidth) / 2, to[1] + (ny * endWidth) / 2],
        [to[0] - (nx * endWidth) / 2, to[1] - (ny * endWidth) / 2],
        [from[0] - (nx * width) / 2, from[1] - (ny * width) / 2],
    ];
}

export function ellipse(cx: number, cy: number, rx: number, ry: number, count = 28): Point[] {
    return Array.from({ length: count }, (_, index): Point => {
        const angle = (index / count) * Math.PI * 2;
        return [cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry];
    });
}

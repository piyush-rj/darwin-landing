import {
    catmullRom,
    type Drawing,
    grain,
    hatch,
    pencilLine,
    type Point,
    type Random,
    shapeOutline,
    type Stroke,
    type Tone,
    toPath,
} from "./sketch";

export type HatchLayer = {
    tone: Tone;
    angle: number;
    spacing: number;
    gap?: number;
    bend?: number;
    region?: Point[];
};

export type ShapeOptions = {
    smooth?: boolean;
    fill?: boolean;
    outline?: Tone | false;
    passes?: number;
    hatches?: HatchLayer[];
    grainTone?: Tone;
    grainDensity?: number;
    grainSize?: number;
};

export function shape(points: Point[], random: Random, options: ShapeOptions = {}): Drawing {
    const {
        smooth = false,
        fill = true,
        outline = "line",
        passes = 2,
        hatches = [],
        grainTone,
        grainDensity = 1,
        grainSize = 5,
    } = options;
    const contour = shapeOutline(points, smooth);
    const strokes: Stroke[] = hatches.map((layer) => ({
        tone: layer.tone,
        d: hatch(layer.region ?? contour, random, {
            angle: layer.angle,
            spacing: layer.spacing,
            gap: layer.gap ?? 0.08,
            bend: layer.bend ?? 0.8,
        }),
    }));
    if (grainTone) {
        strokes.push({
            tone: grainTone,
            d: grain(contour, random, { density: grainDensity, size: grainSize }),
        });
    }
    if (outline) {
        strokes.push({
            tone: outline,
            d: pencilLine(points, random, { closed: true, smooth, passes }),
        });
    }
    return { fill: fill ? toPath(contour, true) : undefined, strokes };
}

export function edgeShade(points: Point[], from: number, to: number, depth: number): Point[] {
    const centerX = points.reduce((sum, [x]) => sum + x, 0) / points.length;
    const centerY = points.reduce((sum, [, y]) => sum + y, 0) / points.length;
    const edge: Point[] = [];
    for (let index = from; index !== to + 1; index = (index + 1) % points.length) {
        edge.push(points[index]);
        if (edge.length > points.length) break;
    }
    const outer = catmullRom(edge, false, 4);
    const inner = outer.map(([x, y]): Point => {
        const dx = centerX - x;
        const dy = centerY - y;
        const length = Math.hypot(dx, dy) || 1;
        return [x + (dx / length) * depth, y + (dy / length) * depth];
    });
    return [...outer, ...inner.reverse()];
}

export function lines(tone: Tone, ...paths: string[]): Drawing {
    return { strokes: [{ tone, d: paths.join("") }] };
}

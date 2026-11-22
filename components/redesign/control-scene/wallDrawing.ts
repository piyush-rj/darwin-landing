import { seededRandom } from "@/lib/seededRandom";

import { lines, shape } from "./shape";
import {
    between,
    catmullRom,
    crack,
    type Drawing,
    ellipse,
    grain,
    hatch,
    offsetPolygon,
    pencilLine,
    type Point,
    type Random,
    toPath,
} from "./sketch";

export const VANISHING_POINT: Point = [-1020, 516];
const WALL_ANCHOR_X = 1070;
export const WALL_LEFT = 1072;
const WALL_RIGHT = 1935;
export const WALL_BASE = 700;
export const HORIZON = 689;

const CORNICE_ANCHOR = 125;

export const wallLineY = (anchorY: number, x: number) =>
    anchorY <= CORNICE_ANCHOR
        ? anchorY - (0.3 + (CORNICE_ANCHOR - anchorY) * 0.0008) * (x - WALL_ANCHOR_X)
        : VANISHING_POINT[1] +
          ((anchorY - VANISHING_POINT[1]) * (x - VANISHING_POINT[0])) /
              (WALL_ANCHOR_X - VANISHING_POINT[0]);

const along = (anchorY: number, x: number): Point => [x, wallLineY(anchorY, x)];

const STONE_COURSES: [top: number, bottom: number][] = [
    [-260, 95],
    [262, 372],
    [372, 497],
    [497, 610],
    [610, WALL_BASE],
];

const FRIEZE_TOP = 125;
const FRIEZE_BOTTOM = 235;

export type NoteSheet = { corners: [Point, Point, Point, Point]; pin: Point };

export const NOTE_SHEETS: NoteSheet[] = [
    {
        corners: [
            [1206, 263],
            [1287, 268],
            [1276, 358],
            [1200, 352],
        ],
        pin: [1247, 266],
    },
    {
        corners: [
            [1364, 246],
            [1449, 233],
            [1455, 334],
            [1372, 349],
        ],
        pin: [1405, 241],
    },
    {
        corners: [
            [1607, 256],
            [1711, 231],
            [1727, 336],
            [1622, 362],
        ],
        pin: [1656, 246],
    },
    {
        corners: [
            [1290, 397],
            [1368, 388],
            [1374, 489],
            [1293, 496],
        ],
        pin: [1330, 393],
    },
    {
        corners: [
            [1478, 351],
            [1575, 361],
            [1560, 465],
            [1462, 455],
        ],
        pin: [1523, 354],
    },
    {
        corners: [
            [1694, 398],
            [1804, 392],
            [1806, 514],
            [1690, 512],
        ],
        pin: [1748, 399],
    },
];

function stoneOutline(x0: number, x1: number, top: number, bottom: number, random: Random) {
    const gap = 2.2;
    const left = Math.max(x0, WALL_LEFT) + gap;
    const right = x1 - gap;
    const corners: Point[] = [
        [left, wallLineY(top, left) + gap],
        [right, wallLineY(top, right) + gap],
        [right, wallLineY(bottom, right) - gap],
        [left, wallLineY(bottom, left) - gap],
    ];
    const points: Point[] = [];
    corners.forEach((corner, index) => {
        const next = corners[(index + 1) % 4];
        const chamfer = between(random, 0.04, 0.12);
        for (const t of [chamfer, 0.35, 0.65, 1 - chamfer]) {
            points.push([
                corner[0] + (next[0] - corner[0]) * t + between(random, -1.4, 1.4),
                corner[1] + (next[1] - corner[1]) * t + between(random, -1.4, 1.4),
            ]);
        }
    });
    return { points, corners };
}

function stone(x0: number, x1: number, top: number, bottom: number, random: Random): Drawing[] {
    const { points, corners } = stoneOutline(x0, x1, top, bottom, random);
    const [, topRight, bottomRight, bottomLeft] = corners;
    const isDark = random() < 0.35;
    const body = shape(points, random, {
        smooth: true,
        outline: "soft",
        hatches: isDark
            ? [{ tone: "hatch", angle: between(random, 50, 80), spacing: 4, gap: 0.45 }]
            : [],
    });
    const blotches = Array.from({ length: 3 + Math.floor(random() * 4) }, () => {
        const center: Point = [
            between(random, corners[0][0] + 14, topRight[0] - 14),
            between(random, corners[0][1] + 14, bottomLeft[1] - 14),
        ];
        return hatch(
            ellipse(center[0], center[1], between(random, 10, 26), between(random, 6, 14), 14),
            random,
            {
                angle: between(random, 20, 160),
                spacing: 2.6,
                gap: 0.25,
            },
        );
    });
    const footShadow: Point[] = [
        [bottomLeft[0] + 4, bottomLeft[1] - 6],
        [bottomRight[0] - 2, bottomRight[1] - 6],
        [bottomRight[0] - 2, bottomRight[1] - 1],
        [bottomLeft[0] + 4, bottomLeft[1] - 1],
    ];
    const sideShadow: Point[] = [
        [topRight[0] - 6, topRight[1] + 6],
        [topRight[0] - 1, topRight[1] + 6],
        [bottomRight[0] - 1, bottomRight[1] - 4],
        [bottomRight[0] - 6, bottomRight[1] - 4],
    ];
    const crackCount = Math.floor(random() * 2.4);
    const cracks = Array.from({ length: crackCount }, () =>
        crack(
            [
                between(random, corners[0][0] + 10, topRight[0] - 10),
                between(random, corners[0][1] + 8, bottomLeft[1] - 12),
            ],
            random,
            { steps: 3 + Math.floor(random() * 3), length: 11, heading: between(random, 0.6, 2.4) },
        ),
    );
    return [
        body,
        {
            strokes: [
                { tone: "shade", d: hatch(footShadow, random, { angle: 15, spacing: 2.6 }) },
                { tone: "shade", d: hatch(sideShadow, random, { angle: 80, spacing: 2.6 }) },
                { tone: "soft", d: cracks.join("") },
                { tone: "hatch", d: blotches.join("") },
            ],
        },
    ];
}

function stoneCourse(top: number, bottom: number, random: Random): Drawing[] {
    const drawings: Drawing[] = [];
    let x = WALL_LEFT - random() * 90;
    while (x < WALL_RIGHT) {
        const width = between(random, 0.07, 0.1) * (x - VANISHING_POINT[0]);
        const end = Math.min(x + width, WALL_RIGHT + 30);
        if (end > WALL_LEFT + 14) drawings.push(...stone(x, end, top, bottom, random));
        x = end;
    }
    return drawings;
}

function moldingLine(anchorY: number, random: Random, tone: "ink" | "line" | "soft" = "line") {
    return lines(
        tone,
        pencilLine([along(anchorY, WALL_LEFT), along(anchorY, WALL_RIGHT)], random, {
            amplitude: 1.3,
        }),
    );
}

function moldingBand(fromY: number, toY: number, random: Random, spacing: number): Drawing {
    const region: Point[] = [
        along(fromY, WALL_LEFT),
        along(fromY, WALL_RIGHT),
        along(toY, WALL_RIGHT),
        along(toY, WALL_LEFT),
    ];
    return {
        strokes: [{ tone: "shade", d: hatch(region, random, { angle: 78, spacing }) }],
    };
}

function leaf(center: Point, angle: number, size: number, random: Random): Drawing {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const place = ([u, v]: Point): Point => [
        center[0] + u * cos - v * sin,
        center[1] + u * sin + v * cos,
    ];
    const outline = [
        [-size, 0],
        [-size * 0.3, -size * 0.42],
        [size * 0.6, -size * 0.3],
        [size, 0],
        [size * 0.6, size * 0.32],
        [-size * 0.3, size * 0.42],
    ].map((point) => place(point as Point));
    const body = shape(outline, random, {
        smooth: true,
        outline: "line",
        passes: 1,
        hatches: [
            {
                tone: "shade",
                angle: (angle * 180) / Math.PI + 70,
                spacing: 2.4,
                region: [
                    place([-size, 0]),
                    place([size, 0]),
                    place([size * 0.5, size * 0.4]),
                    place([-size * 0.3, size * 0.45]),
                ],
            },
        ],
    });
    body.strokes.push({
        tone: "soft",
        d: toPath([place([-size * 0.8, 0]), place([size * 0.8, 0])]),
    });
    return body;
}

function insideFrieze([x, y]: Point, margin: number) {
    return y > wallLineY(FRIEZE_TOP, x) + margin && y < wallLineY(FRIEZE_BOTTOM, x) - margin;
}

function limb(
    controls: Point[],
    startWidth: number,
    endWidth: number,
    random: Random,
    drawings: Drawing[],
    leafSpacing = 20,
) {
    const spine = catmullRom(controls, false, 8);
    const upper: Point[] = [];
    const lower: Point[] = [];
    spine.forEach((point, index) => {
        const next = spine[Math.min(index + 1, spine.length - 1)];
        const previous = spine[Math.max(index - 1, 0)];
        const dx = next[0] - previous[0];
        const dy = next[1] - previous[1];
        const size = Math.hypot(dx, dy) || 1;
        const t = index / (spine.length - 1);
        const half = (startWidth + (endWidth - startWidth) * t) / 2;
        upper.push([point[0] + (dy / size) * half, point[1] - (dx / size) * half]);
        lower.push([point[0] - (dy / size) * half, point[1] + (dx / size) * half]);
    });
    drawings.push(
        shape([...upper, ...[...lower].reverse()], random, {
            outline: "line",
            passes: 1,
            hatches: [
                {
                    tone: "shade",
                    angle: 70,
                    spacing: 2,
                    region: [...spine, ...[...lower].reverse()],
                },
            ],
        }),
    );
    let travelled = between(random, 8, 16);
    let side = random() < 0.5 ? 1 : -1;
    for (let index = 1; index < spine.length; index++) {
        const [ax, ay] = spine[index - 1];
        const [bx, by] = spine[index];
        travelled -= Math.hypot(bx - ax, by - ay);
        if (travelled > 0) continue;
        travelled = leafSpacing * between(random, 0.7, 1.2);
        const heading = Math.atan2(by - ay, bx - ax);
        const leafAngle = heading + side * between(random, 0.55, 1.05);
        const reach = startWidth / 2 + 11;
        const center: Point = [bx + Math.cos(leafAngle) * reach, by + Math.sin(leafAngle) * reach];
        if (insideFrieze(center, 7)) {
            drawings.push(leaf(center, leafAngle, between(random, 10, 14), random));
        }
        side = -side;
    }
    const tip = spine[spine.length - 1];
    const heading = Math.atan2(
        tip[1] - spine[spine.length - 2][1],
        tip[0] - spine[spine.length - 2][0],
    );
    const tipLeaf: Point = [tip[0] + Math.cos(heading) * 9, tip[1] + Math.sin(heading) * 9];
    if (insideFrieze(tipLeaf, 6)) drawings.push(leaf(tipLeaf, heading, 10, random));
}

const TREE_LIMBS: { controls: Point[]; width: [number, number] }[] = [
    {
        controls: [
            [1455, 130],
            [1415, 121],
            [1370, 126],
            [1325, 118],
            [1284, 124],
        ],
        width: [11, 2.5],
    },
    {
        controls: [
            [1457, 124],
            [1432, 101],
            [1400, 86],
            [1364, 76],
            [1332, 78],
        ],
        width: [10, 2.5],
    },
    {
        controls: [
            [1460, 122],
            [1450, 92],
            [1436, 64],
            [1424, 42],
        ],
        width: [9, 2.5],
    },
    {
        controls: [
            [1464, 122],
            [1478, 90],
            [1494, 60],
            [1510, 34],
        ],
        width: [9, 2.5],
    },
    {
        controls: [
            [1467, 124],
            [1495, 99],
            [1530, 82],
            [1570, 72],
            [1610, 70],
        ],
        width: [10, 2.5],
    },
    {
        controls: [
            [1469, 130],
            [1510, 122],
            [1555, 125],
            [1600, 115],
            [1646, 120],
        ],
        width: [11, 2.5],
    },
];

const TREE_TWIGS: Point[][] = [
    [
        [1385, 124],
        [1372, 108],
        [1352, 98],
    ],
    [
        [1338, 120],
        [1318, 136],
        [1296, 146],
    ],
    [
        [1408, 88],
        [1402, 66],
        [1388, 54],
    ],
    [
        [1442, 70],
        [1416, 66],
        [1396, 62],
    ],
    [
        [1488, 72],
        [1512, 70],
        [1534, 58],
    ],
    [
        [1540, 80],
        [1548, 58],
        [1560, 42],
    ],
    [
        [1532, 124],
        [1548, 142],
        [1574, 150],
    ],
    [
        [1590, 117],
        [1606, 100],
        [1630, 92],
    ],
];

function treeOfLife(random: Random): Drawing[] {
    const baseX = 1462;
    const baseY = wallLineY(FRIEZE_BOTTOM, baseX) - 3;
    const forkY = 126;
    const trunk: Point[] = [
        [baseX - 26, baseY],
        [baseX - 13, baseY - 10],
        [baseX - 10, baseY - 32],
        [baseX - 8, forkY],
        [baseX + 8, forkY],
        [baseX + 10, baseY - 30],
        [baseX + 14, baseY - 10],
        [baseX + 28, baseY],
    ];
    const drawings: Drawing[] = [];
    TREE_TWIGS.forEach((twig) => limb(twig, 4, 1.5, random, drawings, 15));
    TREE_LIMBS.forEach(({ controls, width }) =>
        limb(controls, width[0] + 3, width[1], random, drawings, 21),
    );
    drawings.push(
        shape(trunk, random, {
            smooth: true,
            outline: "line",
            hatches: [
                {
                    tone: "shade",
                    angle: 86,
                    spacing: 2.2,
                    region: [
                        [baseX - 26, baseY],
                        [baseX - 8, forkY],
                        [baseX - 1, forkY],
                        [baseX - 2, baseY],
                    ],
                },
            ],
        }),
        lines(
            "soft",
            pencilLine(
                [
                    [baseX - 3, baseY - 4],
                    [baseX - 1, forkY + 8],
                ],
                random,
                { passes: 1 },
            ),
            pencilLine(
                [
                    [baseX + 5, baseY - 6],
                    [baseX + 3, forkY + 14],
                ],
                random,
                { passes: 1 },
            ),
        ),
    );
    return drawings;
}

function songbird(random: Random): Drawing[] {
    const perch = pencilLine(
        [
            [1112, 206],
            [1150, 196],
            [1196, 184],
            [1250, 172],
        ],
        random,
        { smooth: true, amplitude: 0.8 },
    );
    const body: Point[] = [
        [1203, 126],
        [1213, 129],
        [1219, 138],
        [1216, 150],
        [1211, 163],
        [1201, 177],
        [1187, 188],
        [1170, 196],
        [1152, 207],
        [1139, 215],
        [1135, 211],
        [1149, 197],
        [1159, 184],
        [1168, 166],
        [1178, 149],
        [1188, 136],
        [1195, 129],
    ];
    const belly: Point[] = [
        [1217, 146],
        [1210, 162],
        [1200, 176],
        [1186, 188],
        [1172, 192],
        [1190, 170],
        [1206, 150],
    ];
    const bird = shape(body, random, {
        smooth: true,
        outline: "ink",
        hatches: [{ tone: "shade", angle: 30, spacing: 2.4, region: belly }],
        grainTone: "grain",
        grainDensity: 2.2,
        grainSize: 3,
    });
    const details = [
        toPath([
            [1218, 134],
            [1229, 138],
            [1217, 142],
        ]),
        pencilLine(
            [
                [1196, 150],
                [1184, 164],
                [1168, 182],
                [1156, 194],
            ],
            random,
            { smooth: true, passes: 1 },
        ),
        pencilLine(
            [
                [1194, 156],
                [1182, 172],
                [1170, 186],
            ],
            random,
            { smooth: true, passes: 1 },
        ),
        toPath([
            [1196, 180],
            [1194, 188],
        ]),
        toPath([
            [1188, 182],
            [1186, 190],
        ]),
    ];
    const eye = shape(ellipse(1209, 135, 2, 2, 10), random, {
        outline: "ink",
        passes: 1,
        hatches: [{ tone: "dark", angle: 0, spacing: 1 }],
    });
    const twigLeaves = [
        leaf([1128, 186], -2.2, 8, random),
        leaf([1146, 210], 2.6, 8, random),
        leaf([1232, 162], -1.2, 8, random),
        leaf([1244, 186], 0.6, 8, random),
    ];
    return [lines("line", perch), ...twigLeaves, bird, lines("line", ...details), eye];
}

function ammonite(random: Random): Drawing[] {
    const center: Point = [1765, 74];
    const radius = 56;
    const growth = 0.105;
    const radiusAt = (theta: number) => radius * Math.exp(-growth * theta);
    const point = (theta: number, scale = 1): Point => [
        center[0] + Math.cos(theta - 0.4) * radiusAt(theta) * scale,
        center[1] + Math.sin(theta - 0.4) * radiusAt(theta) * scale * 0.94,
    ];
    const spiral: Point[] = [];
    for (let theta = 0; theta < Math.PI * 6.2; theta += 0.12) spiral.push(point(theta));
    const outer: Point[] = [];
    for (let theta = 0; theta < Math.PI * 2; theta += 0.12) outer.push(point(theta));
    const ribs: string[] = [];
    for (let theta = 0; theta < Math.PI * 4.2; theta += 0.21) {
        const from = point(theta + Math.PI * 2);
        const to = point(theta, 0.98);
        const bendTo = point(theta + 0.12, 0.9);
        ribs.push(
            `M${from[0].toFixed(1)} ${from[1].toFixed(1)}Q${bendTo[0].toFixed(1)} ${bendTo[1].toFixed(1)} ${to[0].toFixed(1)} ${to[1].toFixed(1)}`,
        );
    }
    const shadowSide: Point[] = [];
    for (let theta = -0.2; theta < Math.PI * 1.1; theta += 0.15) shadowSide.push(point(theta));
    return [
        shape(outer, random, { smooth: true, outline: "ink" }),
        {
            strokes: [
                { tone: "line", d: pencilLine(spiral, random, { passes: 1, amplitude: 0.6 }) },
                { tone: "soft", d: ribs.join("") },
                {
                    tone: "shade",
                    d: hatch([...shadowSide, center], random, {
                        angle: -40,
                        spacing: 2.6,
                        gap: 0.2,
                    }),
                },
            ],
        },
    ];
}

function vine(random: Random): Drawing[] {
    const stem = pencilLine(
        [
            [1098, 214],
            [1104, 190],
            [1118, 170],
            [1112, 148],
            [1124, 132],
        ],
        random,
        { smooth: true, passes: 1 },
    );
    return [
        lines("line", stem),
        leaf([1112, 196], -2.6, 7, random),
        leaf([1124, 164], -0.3, 7, random),
        leaf([1104, 150], -2.4, 6, random),
        leaf([1130, 136], -1.1, 6, random),
    ];
}

function wallCorner(random: Random): Drawing[] {
    const sideFace: Point[] = [
        [1060, -10],
        [WALL_LEFT, -10],
        [WALL_LEFT, WALL_BASE],
        [1062, WALL_BASE - 3],
    ];
    return [
        shape(sideFace, random, {
            outline: false,
            hatches: [{ tone: "shade", angle: 88, spacing: 2.4 }],
        }),
        lines(
            "ink",
            pencilLine(
                [
                    [1060, -10],
                    [1062, WALL_BASE - 3],
                ],
                random,
            ),
            pencilLine(
                [
                    [WALL_LEFT, -10],
                    [WALL_LEFT, WALL_BASE],
                ],
                random,
            ),
        ),
    ];
}

function wallFace(): Point[] {
    return [
        [1060, -10],
        [WALL_RIGHT, -10],
        along(WALL_BASE, WALL_RIGHT),
        [WALL_LEFT, WALL_BASE],
        [1062, WALL_BASE - 3],
    ];
}

function noteSheet({ corners, pin }: NoteSheet, random: Random): Drawing[] {
    const shadow = offsetPolygon(corners, 6, 8);
    const [topLeft, topRight, bottomRight, bottomLeft] = corners;
    const curl: Point[] = [
        [bottomRight[0] - 16, bottomRight[1] + 1],
        [bottomRight[0] - 5, bottomRight[1] - 4],
        [bottomRight[0] + 1, bottomRight[1] - 14],
    ];
    const pinHead = ellipse(pin[0], pin[1], 5.5, 5, 16);
    return [
        shape(shadow, random, {
            fill: false,
            outline: false,
            hatches: [{ tone: "shade", angle: 35, spacing: 2.2 }],
        }),
        shape(corners, random, { outline: "ink" }),
        lines(
            "soft",
            pencilLine(curl, random, { smooth: true, passes: 1, amplitude: 0.4 }),
            toPath([
                [topLeft[0] + 6, topLeft[1] + 4],
                [topRight[0] - 6, topRight[1] + 4],
            ]),
        ),
        {
            strokes: [
                {
                    tone: "hatch",
                    d: hatch(
                        [
                            [bottomRight[0] - 16, bottomRight[1]],
                            [bottomRight[0], bottomRight[1] - 14],
                            [bottomRight[0], bottomRight[1]],
                        ],
                        random,
                        { angle: 45, spacing: 1.8 },
                    ),
                },
                {
                    tone: "dark",
                    d: toPath([
                        [pin[0] + 2, pin[1] + 4],
                        [pin[0] + 8, pin[1] + 11],
                    ]),
                },
            ],
        },
        shape(pinHead, random, {
            outline: "ink",
            passes: 1,
            hatches: [
                { tone: "dark", angle: 30, spacing: 1.2 },
                { tone: "dark", angle: -40, spacing: 1.4 },
            ],
        }),
        lines(
            "soft",
            toPath([
                [bottomLeft[0] + 2, bottomLeft[1] - 2],
                [bottomRight[0] - 18, bottomRight[1] - 1],
            ]),
        ),
    ];
}

function grainTile(size: number, count: number, random: Random) {
    const square: Point[] = [
        [0, 0],
        [size, 0],
        [size, size],
        [0, size],
    ];
    return grain(square, random, { density: (count * 220) / (size * size), size: 6 });
}

export const GRAIN_TILES = (() => {
    const random = seededRandom(1859);
    return [
        { size: 173, d: grainTile(173, 420, random) },
        { size: 241, d: grainTile(241, 620, random) },
    ];
})();

export function drawWall(): Drawing[] {
    const random = seededRandom(1916);
    const face = shape(wallFace(), random, {
        outline: false,
        hatches: [
            { tone: "dark", angle: 70, spacing: 1.8 },
            { tone: "shade", angle: -10, spacing: 2.2 },
        ],
    });
    const stones = STONE_COURSES.flatMap(([top, bottom]) => stoneCourse(top, bottom, random));
    const friezeBand = toPath(
        [
            along(95, WALL_LEFT),
            along(95, WALL_RIGHT),
            along(262, WALL_RIGHT),
            along(262, WALL_LEFT),
        ],
        true,
    );
    return [
        face,
        ...stones,
        { texture: toPath(wallFace(), true), strokes: [] },
        { fill: friezeBand, strokes: [] },
        moldingBand(103, FRIEZE_TOP, random, 3.4),
        moldingBand(242, 262, random, 2.8),
        { texture: friezeBand, strokes: [] },
        moldingLine(95, random, "ink"),
        moldingLine(103, random),
        moldingLine(FRIEZE_TOP, random, "ink"),
        moldingLine(FRIEZE_BOTTOM, random, "ink"),
        moldingLine(242, random),
        moldingLine(262, random, "ink"),
        ...vine(random),
        ...songbird(random),
        ...treeOfLife(random),
        ...ammonite(random),
        ...wallCorner(random),
        ...NOTE_SHEETS.flatMap((note) => noteSheet(note, random)),
    ];
}

const FLOOR_ROWS = [790, 818, 852, 896, 952, 1025, 1120, 1260];
const SIDE_VANISHING_POINT: Point = [2600, 560];

function floorRowY(rowAtRight: number, x: number) {
    return (
        VANISHING_POINT[1] +
        ((rowAtRight - VANISHING_POINT[1]) * (x - VANISHING_POINT[0])) / (1916 - VANISHING_POINT[0])
    );
}

function rowStartX(rowAtRight: number) {
    const slope = (rowAtRight - VANISHING_POINT[1]) / (1916 - VANISHING_POINT[0]);
    return Math.max(30, VANISHING_POINT[0] + (HORIZON - VANISHING_POINT[1]) / slope);
}

export function drawFloor(): Drawing[] {
    const random = seededRandom(821);
    const rows = FLOOR_ROWS.map((row) => {
        const start = rowStartX(row);
        return pencilLine(
            [
                [start, floorRowY(row, start)],
                [WALL_RIGHT, floorRowY(row, WALL_RIGHT)],
            ],
            random,
            { amplitude: 1.4, passes: 1 },
        );
    });
    const joints: string[] = [];
    for (let index = 0; index + 1 < FLOOR_ROWS.length; index++) {
        const upper = FLOOR_ROWS[index];
        const lower = FLOOR_ROWS[index + 1];
        const start = rowStartX(upper);
        let x = start + between(random, 20, 140);
        while (x < WALL_RIGHT) {
            const from: Point = [x, floorRowY(upper, x)];
            const dx = from[0] - SIDE_VANISHING_POINT[0];
            const dy = from[1] - SIDE_VANISHING_POINT[1];
            const length = Math.hypot(dx, dy);
            let to: Point = from;
            for (let step = 1; step < 400; step++) {
                const candidate: Point = [
                    from[0] + (dx / length) * step,
                    from[1] + (dy / length) * step,
                ];
                to = candidate;
                if (candidate[1] >= floorRowY(lower, candidate[0])) break;
            }
            joints.push(pencilLine([from, to], random, { passes: 1, amplitude: 0.9 }));
            x += between(random, 0.11, 0.2) * (x - VANISHING_POINT[0]) * ((lower - 516) / 400);
        }
    }
    const floorRegion: Point[] = [
        [30, HORIZON],
        [WALL_LEFT, HORIZON + 4],
        along(WALL_BASE, WALL_RIGHT),
        [WALL_RIGHT, 830],
        [30, 830],
    ];
    const cracks = Array.from({ length: 22 }, () =>
        crack([between(random, 300, 1900), between(random, 705, 815)], random, {
            steps: 3,
            length: 16,
            heading: between(random, -0.3, 0.3) + (random() < 0.5 ? 0 : Math.PI),
        }),
    );
    const horizon = pencilLine(
        [
            [30, HORIZON],
            [WALL_LEFT, HORIZON + 4],
        ],
        random,
        { amplitude: 1, passes: 2 },
    );
    const wallFoot: Point[] = [
        [WALL_LEFT, WALL_BASE - 4],
        along(WALL_BASE - 4, WALL_RIGHT),
        along(WALL_BASE + 8, WALL_RIGHT),
        [WALL_LEFT, WALL_BASE + 6],
    ];
    return [
        {
            strokes: [
                { tone: "grain", d: grain(floorRegion, random, { density: 0.8, size: 6 }) },
                {
                    tone: "hatch",
                    d: hatch(floorRegion, random, { angle: 4, spacing: 7, gap: 0.55 }),
                },
                { tone: "soft", d: rows.join("") + joints.join("") },
                { tone: "soft", d: cracks.join("") },
                { tone: "line", d: horizon },
                { tone: "shade", d: hatch(wallFoot, random, { angle: 8, spacing: 2.2 }) },
            ],
        },
    ];
}

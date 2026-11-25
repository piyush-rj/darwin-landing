import { seededRandom } from "@/lib/seededRandom";

import { edgeShade, type HatchLayer, lines, shape } from "./shape";
import {
    band,
    catmullRom,
    type Drawing,
    ellipse,
    hatch,
    lerp,
    pencilLine,
    type Point,
    type Random,
    toPath,
} from "./sketch";

type Fabric = "knit" | "sweater" | "twill" | "rib" | "skin";

const FABRIC_BASE: Record<Fabric, HatchLayer[]> = {
    knit: [
        { tone: "shade", angle: 58, spacing: 3.2, bend: 1.8, gap: 0.25 },
        { tone: "hatch", angle: -32, spacing: 6.4, gap: 0.6, bend: 1.4 },
    ],
    sweater: [
        { tone: "shade", angle: 54, spacing: 2.4, bend: 2, gap: 0.15 },
        { tone: "hatch", angle: -38, spacing: 3.4, gap: 0.3, bend: 1.6 },
        { tone: "dark", angle: 8, spacing: 7, gap: 0.55, bend: 2.2 },
    ],
    twill: [
        { tone: "shade", angle: 0, spacing: 2.8, bend: 2, gap: 0.2 },
        { tone: "hatch", angle: 70, spacing: 6.4, gap: 0.6 },
    ],
    rib: [{ tone: "dark", angle: 0, spacing: 1.9 }],
    skin: [{ tone: "hatch", angle: 64, spacing: 4.4, gap: 0.6, bend: 1.2 }],
};

const SWEATER_TINT = "fill-stone-300";
const TROUSER_TINT = "fill-stone-400";
const CUSHION_TINT = "fill-stone-300";
const INK_TINT = "fill-stone-800";

type Garment = {
    points: Point[];
    fabric: Fabric;
    tint?: string;
    grainAngle?: number;
    shadows?: { from: number; to: number; depth: number; angle: number; deep?: boolean }[];
    folds?: Point[][];
    openSeam?: { from: number; to: number };
};

function openOutline(points: Point[], { from, to }: { from: number; to: number }) {
    const samples = 6;
    const curve = catmullRom(points, true, samples);
    const path: Point[] = [];
    for (let index = to * samples; index !== from * samples; index = (index + 1) % curve.length) {
        path.push(curve[index]);
    }
    path.push(curve[from * samples]);
    return path;
}

function garment(
    { points, fabric, tint, grainAngle = 0, shadows = [], folds = [], openSeam }: Garment,
    random: Random,
): Drawing[] {
    const base = FABRIC_BASE[fabric].map((layer) => ({
        ...layer,
        angle: layer.angle + grainAngle,
    }));
    const shading: HatchLayer[] = shadows.flatMap(({ from, to, depth, angle, deep }) => {
        const region = edgeShade(points, from, to, depth);
        const layers: HatchLayer[] = [{ tone: "shade", angle, spacing: 2.1, region, bend: 1.2 }];
        if (deep) {
            layers.push({
                tone: "dark",
                angle: angle - 50,
                spacing: 2.6,
                region: edgeShade(points, from, to, depth * 0.55),
            });
        }
        return layers;
    });
    return [
        shape(points, random, {
            smooth: true,
            tint,
            outline: openSeam ? false : fabric === "skin" ? "line" : "ink",
            hatches: [...base, ...shading],
            grainTone: fabric === "knit" || fabric === "sweater" ? "shade" : undefined,
            grainDensity: 0.8,
            grainSize: 2.6,
        }),
        lines(
            "line",
            openSeam ? pencilLine(openOutline(points, openSeam), random) : "",
            ...folds.map((fold) =>
                pencilLine(fold, random, { smooth: true, passes: 1, amplitude: 0.4, reach: 2 }),
            ),
        ),
    ];
}

function limb(from: Point, to: Point, startWidth: number, endWidth: number, bulge = 0.08) {
    const length = Math.hypot(to[0] - from[0], to[1] - from[1]) || 1;
    const dx = (to[0] - from[0]) / length;
    const dy = (to[1] - from[1]) / length;
    const nx = -dy;
    const ny = dx;
    const mid = lerp(from, to, 0.5);
    const midWidth = ((startWidth + endWidth) / 2) * (1 + bulge);
    const side = (point: Point, width: number, sign: number): Point => [
        point[0] + nx * (width / 2) * sign,
        point[1] + ny * (width / 2) * sign,
    ];
    const cap = (point: Point, width: number, sign: number): Point => [
        point[0] + dx * width * 0.32 * sign,
        point[1] + dy * width * 0.32 * sign,
    ];
    return [
        side(from, startWidth, 1),
        side(mid, midWidth, 1),
        side(to, endWidth, 1),
        cap(to, endWidth, 1),
        side(to, endWidth, -1),
        side(mid, midWidth, -1),
        side(from, startWidth, -1),
        cap(from, startWidth, -1),
    ] satisfies Point[];
}

function ribTicks(from: Point, to: Point, count: number, length: number, tilt = 0) {
    return Array.from({ length: count }, (_, index) => {
        const t = (index + 0.5) / count;
        const x = from[0] + (to[0] - from[0]) * t;
        const y = from[1] + (to[1] - from[1]) * t;
        return toPath([
            [x - tilt, y - length / 2],
            [x + tilt, y + length / 2],
        ]);
    }).join("");
}

function crossLace([x, y]: Point, size = 3.2) {
    return (
        toPath([
            [x - size, y - size],
            [x + size, y + size],
        ]) +
        toPath([
            [x + size, y - size],
            [x - size, y + size],
        ])
    );
}

function wood(from: Point, to: Point, width: number, random: Random, darker = false): Drawing[] {
    const plank = band(from, to, width);
    const angle = (Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI;
    const grainLines = [0.3, 0.55, 0.78].map((offset) => {
        const a: Point = [
            plank[0][0] + (plank[3][0] - plank[0][0]) * offset,
            plank[0][1] + (plank[3][1] - plank[0][1]) * offset,
        ];
        const b: Point = [
            plank[1][0] + (plank[2][0] - plank[1][0]) * offset,
            plank[1][1] + (plank[2][1] - plank[1][1]) * offset,
        ];
        return pencilLine([a, b], random, { passes: 1, amplitude: 0.5 });
    });
    const shadedEdge: Point[] = [
        plank[2],
        plank[3],
        [(plank[0][0] + plank[3][0]) / 2, (plank[0][1] + plank[3][1]) / 2],
        [(plank[1][0] + plank[2][0]) / 2, (plank[1][1] + plank[2][1]) / 2],
    ];
    return [
        shape(plank, random, {
            outline: "ink",
            hatches: [
                {
                    tone: darker ? "dark" : "shade",
                    angle: angle + 8,
                    spacing: 2.6,
                    region: shadedEdge,
                },
                { tone: "hatch", angle: angle + 2, spacing: 3.2, gap: 0.35 },
            ],
        }),
        lines("soft", ...grainLines),
    ];
}

type Sneaker = {
    outline: Point[];
    shadow: { from: number; to: number };
    sole: Point[];
    toeCap: Point[];
    heel: Point[];
    collar: Point[];
    laces: Point[];
};

function sneaker(
    { outline, shadow, sole, toeCap, heel, collar, laces }: Sneaker,
    random: Random,
): Drawing[] {
    return [
        shape(outline, random, {
            smooth: true,
            outline: "ink",
            hatches: [
                { tone: "hatch", angle: 75, spacing: 4.6, gap: 0.55 },
                {
                    tone: "shade",
                    angle: 20,
                    spacing: 2,
                    region: edgeShade(outline, shadow.from, shadow.to, 6),
                },
            ],
        }),
        shape(sole, random, { smooth: true, outline: "ink", passes: 1, tint: INK_TINT }),
        lines("ink", pencilLine(collar, random, { smooth: true, passes: 1, amplitude: 0.3 })),
        lines(
            "line",
            pencilLine(toeCap, random, { smooth: true, passes: 1, amplitude: 0.3 }),
            pencilLine(heel, random, { smooth: true, passes: 1, amplitude: 0.3 }),
            ...laces.map((lace) => crossLace(lace)),
        ),
    ];
}

function groundShadow(random: Random): Drawing {
    const pool = ellipse(820, 764, 240, 15, 36);
    const deep = ellipse(790, 762, 130, 8, 28);
    return {
        strokes: [
            { tone: "shade", d: hatch(pool, random, { angle: 8, spacing: 2.8, gap: 0.2 }) },
            { tone: "shade", d: hatch(deep, random, { angle: -24, spacing: 2.4 }) },
            {
                tone: "dark",
                d: hatch(ellipse(966, 762, 56, 4, 20), random, { angle: 4, spacing: 1.6 }),
            },
        ],
    };
}

const FAR_KNEE: Point = [906, 566];
const FAR_ANKLE: Point = [936, 724];
const NEAR_KNEE: Point = [904, 534];
const NEAR_ANKLE: Point = [1000, 612];
const NEAR_SHOULDER: Point = [752, 442];
const NEAR_ELBOW: Point = [804, 506];
const NEAR_WRIST: Point = [816, 448];

export const SHOULDER_PIVOT: Point = NEAR_SHOULDER;
export const ELBOW_PIVOT: Point = NEAR_ELBOW;
export const WRIST_PIVOT: Point = NEAR_WRIST;
export const NECK_PIVOT: Point = [716, 412];
export const KNEE_PIVOT: Point = NEAR_KNEE;
export const HIP_PIVOT: Point = [700, 604];

const BACK_POST_FOOT: Point = [660, 756];
const BACK_POST_TOP: Point = [628, 440];

const TORSO: Garment = {
    fabric: "sweater",
    tint: SWEATER_TINT,
    points: [
        [684, 416],
        [676, 450],
        [678, 500],
        [684, 550],
        [690, 598],
        [730, 604],
        [770, 598],
        [772, 548],
        [770, 500],
        [766, 456],
        [760, 424],
        [740, 412],
        [710, 410],
    ],
    shadows: [
        { from: 1, to: 4, depth: 10, angle: 84 },
        { from: 6, to: 9, depth: 10, angle: 96 },
    ],
    folds: [
        [
            [688, 470],
            [704, 480],
            [724, 484],
        ],
        [
            [690, 536],
            [710, 546],
            [736, 548],
        ],
        [
            [744, 570],
            [758, 580],
            [766, 592],
        ],
    ],
};

const COLLAR: Point[] = [
    [688, 414],
    [708, 406],
    [734, 406],
    [754, 416],
    [744, 424],
    [716, 426],
    [694, 422],
];

const FAR_THIGH: Garment = {
    fabric: "twill",
    tint: TROUSER_TINT,
    grainAngle: 2,
    points: limb([740, 574], FAR_KNEE, 46, 46),
    shadows: [{ from: 0, to: 2, depth: 12, angle: 2, deep: true }],
};

const FAR_SHIN: Garment = {
    fabric: "twill",
    tint: TROUSER_TINT,
    grainAngle: 76,
    points: limb([908, 572], FAR_ANKLE, 42, 32),
    shadows: [{ from: 0, to: 2, depth: 10, angle: 76, deep: true }],
    folds: [
        [
            [922, 640],
            [928, 668],
            [934, 698],
        ],
    ],
};

const FAR_CUFF: Point[] = [
    [918, 716],
    [956, 712],
    [958, 728],
    [920, 732],
];

const FAR_SOCK: Point[] = [
    [922, 730],
    [956, 726],
    [958, 740],
    [924, 744],
];

const FAR_SHOE: Sneaker = {
    outline: [
        [918, 732],
        [932, 726],
        [950, 724],
        [966, 728],
        [986, 736],
        [1004, 744],
        [1014, 752],
        [1008, 760],
        [974, 762],
        [930, 762],
        [916, 758],
        [912, 746],
    ],
    shadow: { from: 7, to: 10 },
    sole: [
        [914, 752],
        [944, 754],
        [980, 756],
        [1016, 754],
        [1014, 762],
        [976, 764],
        [932, 764],
        [914, 760],
    ],
    toeCap: [
        [996, 742],
        [992, 752],
        [998, 760],
    ],
    heel: [
        [930, 728],
        [922, 744],
        [926, 758],
    ],
    collar: [
        [920, 732],
        [934, 726],
        [952, 724],
    ],
    laces: [
        [960, 728],
        [972, 732],
        [984, 738],
    ],
};

const NEAR_LEG_UPPER: Garment = {
    fabric: "twill",
    tint: TROUSER_TINT,
    grainAngle: -18,
    points: [
        [694, 576],
        [732, 566],
        [792, 544],
        [852, 524],
        [892, 510],
        [912, 522],
        [916, 544],
        [900, 556],
        [850, 548],
        [790, 556],
        [740, 580],
        [706, 606],
        [692, 602],
    ],
    shadows: [
        { from: 7, to: 10, depth: 12, angle: -18, deep: true },
        { from: 10, to: 12, depth: 10, angle: 60 },
    ],
    folds: [
        [
            [752, 572],
            [782, 562],
            [812, 552],
        ],
        [
            [800, 574],
            [832, 560],
            [864, 546],
        ],
        [
            [708, 590],
            [722, 598],
            [730, 606],
        ],
    ],
};

const NEAR_SHIN: Garment = {
    fabric: "twill",
    tint: TROUSER_TINT,
    grainAngle: 38,
    points: limb([904, 536], NEAR_ANKLE, 44, 32),
    shadows: [{ from: 0, to: 2, depth: 10, angle: 38, deep: true }],
    folds: [
        [
            [930, 566],
            [954, 582],
            [978, 600],
        ],
        [
            [944, 556],
            [962, 570],
        ],
    ],
};

const NEAR_CUFF: Point[] = [
    [986, 604],
    [1010, 594],
    [1020, 612],
    [996, 624],
];

const NEAR_SOCK: Point[] = [
    [996, 614],
    [1016, 606],
    [1024, 622],
    [1004, 632],
];

const NEAR_SHOE: Sneaker = {
    outline: [
        [986, 624],
        [998, 614],
        [1014, 612],
        [1034, 620],
        [1056, 630],
        [1070, 640],
        [1068, 652],
        [1054, 660],
        [1026, 662],
        [1000, 660],
        [986, 652],
    ],
    shadow: { from: 7, to: 10 },
    sole: [
        [986, 654],
        [1002, 660],
        [1028, 662],
        [1056, 660],
        [1070, 650],
        [1072, 658],
        [1056, 668],
        [1026, 670],
        [998, 668],
        [982, 660],
    ],
    toeCap: [
        [1052, 630],
        [1048, 644],
        [1054, 658],
    ],
    heel: [
        [998, 616],
        [990, 632],
        [994, 650],
    ],
    collar: [
        [988, 624],
        [1000, 614],
        [1016, 612],
    ],
    laces: [
        [1020, 614],
        [1032, 618],
        [1044, 626],
    ],
};

const BACKREST: Point[] = [
    [644, 462],
    [676, 458],
    [700, 464],
    [704, 520],
    [702, 560],
    [698, 600],
    [660, 604],
    [652, 540],
    [644, 500],
];

const BACKREST_PIPING: Point[] = [
    [654, 472],
    [692, 474],
    [698, 540],
    [694, 592],
];

const SEAT_CUSHION: Point[] = [
    [698, 598],
    [904, 586],
    [910, 614],
    [704, 628],
];

function cushion(points: Point[], random: Random, angle: number): Drawing[] {
    return [
        shape(points, random, {
            smooth: true,
            outline: "ink",
            tint: CUSHION_TINT,
            hatches: [
                { tone: "shade", angle, spacing: 2.8, gap: 0.2 },
                { tone: "hatch", angle: angle + 70, spacing: 3.4, gap: 0.4, bend: 1.6 },
            ],
            grainTone: "dark",
            grainDensity: 1.4,
            grainSize: 3.5,
        }),
    ];
}

export function drawSeatedFigure(): Drawing[] {
    const random = seededRandom(1809);
    return [
        groundShadow(random),
        ...wood([912, 748], [886, 500], 11, random, true),
        ...wood(BACK_POST_FOOT, BACK_POST_TOP, 14, random, true),
        ...wood([648, 514], [892, 496], 14, random),
        ...cushion(BACKREST, random, 80),
        lines(
            "soft",
            pencilLine(BACKREST_PIPING, random, { smooth: true, passes: 1, amplitude: 0.4 }),
        ),
        ...cushion(SEAT_CUSHION, random, -4),
        ...wood([660, 632], [912, 620], 13, random),
        ...garment(FAR_THIGH, random),
        ...garment(FAR_SHIN, random),
        shape(FAR_CUFF, random, {
            outline: "ink",
            tint: TROUSER_TINT,
            hatches: [{ tone: "dark", angle: 4, spacing: 2.4, gap: 0.3 }],
        }),
        shape(FAR_SOCK, random, { outline: "line", hatches: FABRIC_BASE.rib }),
        ...sneaker(FAR_SHOE, random),
        ...garment(NEAR_LEG_UPPER, random),
    ];
}

export function drawTorso(): Drawing[] {
    const random = seededRandom(1823);
    return [
        ...garment(TORSO, random),
        shape(COLLAR, random, {
            smooth: true,
            outline: "ink",
            tint: SWEATER_TINT,
            hatches: [
                { tone: "dark", angle: 8, spacing: 1.8 },
                { tone: "dark", angle: -60, spacing: 2.6 },
            ],
        }),
        lines("line", ribTicks([692, 598], [768, 596], 14, 10, 0.5)),
    ];
}

export function drawNearFrame(): Drawing[] {
    const random = seededRandom(1901);
    return [
        ...wood([892, 756], [876, 512], 13, random, true),
        ...wood([644, 524], [892, 506], 16, random),
    ];
}

const UPPER_ARM: Garment = {
    fabric: "sweater",
    tint: SWEATER_TINT,
    points: limb([752, 442], NEAR_ELBOW, 40, 34),
    shadows: [{ from: 0, to: 2, depth: 10, angle: 50, deep: true }],
    folds: [
        [
            [766, 466],
            [780, 468],
            [792, 476],
        ],
        [
            [778, 490],
            [792, 490],
            [804, 496],
        ],
    ],
};

const FOREARM: Garment = {
    fabric: "sweater",
    tint: SWEATER_TINT,
    points: limb(NEAR_ELBOW, [814, 456], 34, 26),
    shadows: [{ from: 0, to: 2, depth: 9, angle: -78, deep: true }],
    folds: [
        [
            [796, 488],
            [808, 486],
            [818, 480],
        ],
    ],
};

export function drawUpperArm(): Drawing[] {
    return garment(UPPER_ARM, seededRandom(1831));
}

export function drawForearm(): Drawing[] {
    const random = seededRandom(1859);
    return [...garment(FOREARM, random), lines("soft", ribTicks([804, 468], [826, 464], 6, 6))];
}

const MUG_SHIFT: Point = [-97, -44];

const shift = (points: Point[]): Point[] =>
    points.map(([x, y]) => [x + MUG_SHIFT[0], y + MUG_SHIFT[1]]);

export function drawMugInHand(): Drawing[] {
    const random = seededRandom(1871);
    const mugBody = shift([
        [925, 458],
        [961, 457],
        [959, 499],
        [950, 503],
        [935, 503],
        [927, 499],
    ]);
    const backOfHand = shift([
        [904, 493],
        [902, 483],
        [905, 472],
        [911, 466],
        [918, 463],
        [920, 478],
        [919, 492],
        [912, 497],
    ]);
    const thumb = shift([
        [912, 466],
        [919, 459],
        [928, 455],
        [934, 457],
        [930, 462],
        [920, 467],
    ]);
    const fingers = [464, 471, 478, 485].map((top, index): Point[] => {
        const reach = 935 - index * 0.8;
        return shift([
            [916, top],
            [928, top - 0.6],
            [reach, top + 1.4],
            [reach + 0.6, top + 4],
            [reach - 2, top + 6.6],
            [928, top + 7],
            [916, top + 6.6],
        ]);
    });
    const [mugCx, mugCy] = [943 + MUG_SHIFT[0], 457 + MUG_SHIFT[1]];
    return [
        shape(
            shift([
                [926, 466],
                [916, 468],
                [913, 477],
                [916, 486],
                [926, 488],
            ]),
            random,
            { fill: false, outline: "ink", passes: 1, smooth: true },
        ),
        shape(mugBody, random, {
            outline: "ink",
            hatches: [
                {
                    tone: "shade",
                    angle: 88,
                    spacing: 2.2,
                    region: shift([
                        [948, 459],
                        [961, 457],
                        [959, 499],
                        [950, 503],
                        [946, 502],
                    ]),
                },
                { tone: "hatch", angle: 88, spacing: 4.2, gap: 0.45 },
            ],
        }),
        shape(ellipse(mugCx, mugCy, 18, 4.5, 24), random, { outline: "ink", passes: 1 }),
        shape(ellipse(mugCx + 1, mugCy + 1, 14, 2.8, 20), random, {
            fill: false,
            outline: false,
            hatches: [{ tone: "dark", angle: 4, spacing: 1.2 }],
        }),
        shape(backOfHand, random, {
            smooth: true,
            outline: "ink",
            hatches: [
                { tone: "hatch", angle: 70, spacing: 3, gap: 0.25 },
                { tone: "shade", angle: 30, spacing: 2, region: edgeShade(backOfHand, 6, 7, 6) },
            ],
        }),
        ...fingers.map((finger) =>
            shape(finger, random, {
                smooth: true,
                outline: "ink",
                passes: 1,
                hatches: [
                    {
                        tone: "hatch",
                        angle: 0,
                        spacing: 2.2,
                        region: edgeShade(finger, 4, 6, 2.4),
                    },
                ],
            }),
        ),
        shape(thumb, random, {
            smooth: true,
            outline: "ink",
            passes: 1,
            hatches: [{ tone: "hatch", angle: -20, spacing: 2.4 }],
        }),
    ];
}

const CROSSED_SHIN_SEED = 1876;

export function drawCrossedShin(): Drawing[] {
    const random = seededRandom(CROSSED_SHIN_SEED);
    return [
        ...garment(NEAR_SHIN, random),
        shape(NEAR_CUFF, random, {
            outline: "ink",
            tint: TROUSER_TINT,
            hatches: [{ tone: "dark", angle: -12, spacing: 2.4, gap: 0.3 }],
        }),
        shape(NEAR_SOCK, random, {
            outline: "line",
            hatches: FABRIC_BASE.rib.map((layer) => ({ ...layer, angle: -12 })),
        }),
        ...sneaker(NEAR_SHOE, random),
    ];
}

export const CUBE_LEFT_FACE: Point[] = [
    [648, 300],
    [716, 318],
    [720, 412],
    [654, 398],
];

export const CUBE_RIGHT_FACE: Point[] = [
    [716, 318],
    [782, 296],
    [786, 392],
    [720, 412],
];

export const CUBE_TOP_FACE: Point[] = [
    [648, 300],
    [714, 278],
    [782, 296],
    [716, 318],
];

export function cubeFaceMatrix() {
    const [[ax, ay], [bx, by], , [dx, dy]] = CUBE_RIGHT_FACE;
    return `matrix(${bx - ax} ${by - ay} ${dx - ax} ${dy - ay} ${ax} ${ay})`;
}

export function drawHead(): Drawing[] {
    const random = seededRandom(1882);
    return [
        shape(CUBE_TOP_FACE, random, {
            outline: "ink",
            hatches: [{ tone: "hatch", angle: 20, spacing: 6, gap: 0.5 }],
            grainTone: "grain",
            grainDensity: 1.6,
            grainSize: 5,
        }),
        shape(CUBE_LEFT_FACE, random, {
            outline: "ink",
            hatches: [
                { tone: "shade", angle: 82, spacing: 3 },
                { tone: "shade", angle: -22, spacing: 4.2 },
            ],
            grainTone: "shade",
            grainDensity: 2.6,
            grainSize: 5,
        }),
        shape(CUBE_RIGHT_FACE, random, {
            outline: "ink",
            hatches: [{ tone: "hatch", angle: 64, spacing: 5, gap: 0.3 }],
            grainTone: "grain",
            grainDensity: 2.6,
            grainSize: 5,
        }),
    ];
}

const steamWisp = (d: string) =>
    d.replace(
        /(-?\d+(?:\.\d+)?)\s(-?\d+(?:\.\d+)?)/g,
        (_, x: string, y: string) => `${Number(x) + MUG_SHIFT[0]} ${Number(y) + MUG_SHIFT[1]}`,
    );

export const STEAM_WISPS = [
    "M938 450C930 436 946 426 937 410C930 398 942 390 938 380",
    "M947 451C955 438 941 428 950 414C957 402 947 394 952 384",
    "M955 452C962 442 954 434 960 424",
].map(steamWisp);

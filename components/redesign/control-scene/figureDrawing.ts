import { seededRandom } from "@/lib/seededRandom";

import { edgeShade, type HatchLayer, lines, shape } from "./shape";
import {
    band,
    catmullRom,
    type Drawing,
    ellipse,
    hatch,
    pencilLine,
    type Point,
    type Random,
    toPath,
} from "./sketch";

type Fabric = "knit" | "twill" | "rib";

const FABRIC_BASE: Record<Fabric, HatchLayer[]> = {
    knit: [
        { tone: "shade", angle: 58, spacing: 2.4, bend: 1.8 },
        { tone: "hatch", angle: -32, spacing: 4.2, gap: 0.5, bend: 1.4 },
    ],
    twill: [
        { tone: "shade", angle: 0, spacing: 2.3, bend: 2 },
        { tone: "hatch", angle: 70, spacing: 5, gap: 0.5 },
    ],
    rib: [{ tone: "dark", angle: 0, spacing: 1.9 }],
};

type Garment = {
    points: Point[];
    fabric: Fabric;
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
    { points, fabric, grainAngle = 0, shadows = [], folds = [], openSeam }: Garment,
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
            outline: openSeam ? false : "line",
            hatches: [...base, ...shading],
            grainTone: fabric === "knit" ? "shade" : undefined,
            grainDensity: 1.6,
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

function crossLace([x, y]: Point, size = 3.5) {
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
                { tone: "hatch", angle: 75, spacing: 4.2, gap: 0.45 },
                {
                    tone: "shade",
                    angle: 20,
                    spacing: 1.9,
                    region: edgeShade(outline, shadow.from, shadow.to, 7),
                },
            ],
        }),
        lines(
            "ink",
            pencilLine(sole, random, { smooth: true, passes: 2, amplitude: 0.4 }),
            pencilLine(collar, random, { smooth: true, passes: 1, amplitude: 0.3 }),
        ),
        lines(
            "line",
            pencilLine(toeCap, random, { smooth: true, passes: 1, amplitude: 0.3 }),
            pencilLine(heel, random, { smooth: true, passes: 1, amplitude: 0.3 }),
            ...laces.map((lace) => crossLace(lace)),
        ),
    ];
}

function chairShadow(random: Random): Drawing {
    const pool = ellipse(905, 744, 225, 17, 36);
    const deep = ellipse(930, 742, 140, 9, 28);
    return {
        strokes: [
            { tone: "shade", d: hatch(pool, random, { angle: 8, spacing: 2.6, gap: 0.15 }) },
            { tone: "shade", d: hatch(deep, random, { angle: -24, spacing: 2.4 }) },
            {
                tone: "dark",
                d: hatch(ellipse(1088, 736, 52, 4, 20), random, { angle: 4, spacing: 1.6 }),
            },
        ],
    };
}

const TORSO: Garment = {
    fabric: "knit",
    points: [
        [748, 411],
        [733, 419],
        [723, 433],
        [718, 452],
        [722, 476],
        [782, 482],
        [816, 556],
        [840, 586],
        [878, 586],
        [914, 574],
        [947, 550],
        [959, 520],
        [958, 496],
        [946, 475],
        [906, 452],
        [872, 434],
        [842, 424],
        [808, 416],
    ],
    shadows: [
        { from: 1, to: 4, depth: 20, angle: 72, deep: true },
        { from: 6, to: 10, depth: 24, angle: 18, deep: true },
    ],
    folds: [
        [
            [736, 442],
            [752, 433],
            [772, 431],
        ],
        [
            [772, 456],
            [792, 448],
            [814, 447],
        ],
        [
            [840, 522],
            [858, 532],
            [872, 550],
        ],
        [
            [884, 562],
            [908, 557],
            [932, 545],
        ],
        [
            [842, 576],
            [880, 572],
            [915, 561],
            [944, 541],
        ],
    ],
};

const COLLAR: Point[] = [
    [738, 404],
    [770, 401],
    [805, 399],
    [835, 397],
    [864, 396],
    [860, 410],
    [832, 416],
    [806, 421],
    [772, 421],
    [750, 418],
];

const SEAT_CUSHION: Point[] = [
    [848, 598],
    [930, 590],
    [1012, 586],
    [1021, 598],
    [1019, 620],
    [930, 636],
    [856, 648],
    [846, 630],
];

const BACK_CUSHION: Point[] = [
    [701, 470],
    [708, 460],
    [740, 457],
    [789, 452],
    [800, 460],
    [826, 552],
    [851, 634],
    [845, 648],
    [790, 650],
    [745, 652],
    [736, 643],
    [718, 560],
];

const BACK_SIDE: Point[] = [
    [789, 452],
    [803, 452],
    [861, 634],
    [851, 640],
];

const GROUND_SHIN: Garment = {
    fabric: "twill",
    grainAngle: 78,
    points: [
        [1013, 548],
        [1047, 546],
        [1059, 566],
        [1067, 590],
        [1074, 625],
        [1081, 659],
        [1039, 664],
        [1032, 640],
        [1023, 606],
        [1015, 576],
    ],
    shadows: [{ from: 6, to: 9, depth: 15, angle: 70, deep: true }],
    folds: [
        [
            [1053, 576],
            [1060, 610],
            [1068, 648],
        ],
        [
            [1040, 646],
            [1058, 642],
            [1076, 646],
        ],
        [
            [1027, 592],
            [1038, 588],
        ],
    ],
};

const GROUND_CUFF: Point[] = [
    [1037, 656],
    [1082, 652],
    [1085, 668],
    [1039, 673],
];

const GROUND_SOCK: Point[] = [
    [1042, 671],
    [1078, 668],
    [1080, 690],
    [1045, 695],
];

const GROUND_SHOE: Sneaker = {
    outline: [
        [1036, 698],
        [1048, 691],
        [1066, 688],
        [1080, 686],
        [1092, 694],
        [1106, 702],
        [1122, 710],
        [1133, 718],
        [1136, 726],
        [1131, 731],
        [1100, 732],
        [1050, 732],
        [1037, 728],
        [1034, 712],
    ],
    shadow: { from: 9, to: 13 },
    sole: [
        [1035, 722],
        [1080, 725],
        [1135, 724],
    ],
    toeCap: [
        [1118, 708],
        [1113, 719],
        [1120, 730],
    ],
    heel: [
        [1047, 693],
        [1041, 711],
        [1045, 727],
    ],
    collar: [
        [1040, 697],
        [1053, 690],
        [1071, 688],
    ],
    laces: [
        [1084, 691],
        [1092, 695],
        [1100, 700],
    ],
};

const CROSSED_THIGH: Garment = {
    fabric: "twill",
    grainAngle: -28,
    points: [
        [930, 506],
        [958, 498],
        [985, 488],
        [1008, 478],
        [1024, 475],
        [1036, 480],
        [1041, 491],
        [1036, 505],
        [1027, 521],
        [1010, 533],
        [984, 546],
        [955, 558],
        [928, 566],
    ],
    shadows: [{ from: 8, to: 12, depth: 17, angle: -20, deep: true }],
    folds: [
        [
            [940, 513],
            [958, 508],
            [974, 499],
        ],
        [
            [954, 531],
            [976, 522],
            [996, 511],
        ],
        [
            [1010, 485],
            [1020, 493],
            [1026, 504],
        ],
        [
            [1019, 480],
            [1031, 489],
        ],
        [
            [1018, 523],
            [1030, 512],
        ],
    ],
};

export function drawSeatedFigure(): Drawing[] {
    const random = seededRandom(1809);
    return [
        chairShadow(random),
        ...wood([886, 648], [896, 720], 9, random),
        ...garment(TORSO, random),
        lines(
            "soft",
            ribTicks([846, 572], [942, 538], 16, 8, 1),
            pencilLine(
                [
                    [844, 568],
                    [880, 564],
                    [913, 554],
                    [940, 533],
                ],
                random,
                { smooth: true, passes: 1 },
            ),
        ),
        shape(COLLAR, random, {
            smooth: true,
            outline: "ink",
            hatches: [
                { tone: "dark", angle: 8, spacing: 1.8 },
                { tone: "dark", angle: -60, spacing: 2.6 },
            ],
        }),
        lines("line", ribTicks([746, 412], [860, 406], 22, 10, 0.6)),
        shape(SEAT_CUSHION, random, {
            smooth: true,
            outline: "ink",
            hatches: [
                { tone: "hatch", angle: -8, spacing: 4.2 },
                {
                    tone: "shade",
                    angle: -8,
                    spacing: 2.6,
                    region: [
                        [850, 632],
                        [1019, 606],
                        [1019, 620],
                        [856, 648],
                    ],
                },
            ],
            grainTone: "grain",
            grainDensity: 1.5,
            grainSize: 4,
        }),
        ...garment(GROUND_SHIN, random),
        shape(GROUND_CUFF, random, {
            outline: "ink",
            hatches: [
                { tone: "shade", angle: 4, spacing: 2.4 },
                { tone: "dark", angle: 70, spacing: 3.2, gap: 0.4 },
            ],
        }),
        shape(GROUND_SOCK, random, {
            outline: "line",
            hatches: FABRIC_BASE.rib,
        }),
        lines("dark", ribTicks([1046, 680], [1076, 678], 7, 16)),
        ...sneaker(GROUND_SHOE, random),
        ...garment(CROSSED_THIGH, random),
        shape(BACK_CUSHION, random, {
            smooth: true,
            outline: "ink",
            hatches: [
                { tone: "shade", angle: 76, spacing: 3 },
                { tone: "shade", angle: -18, spacing: 3.8, gap: 0.15 },
                { tone: "dark", angle: 30, spacing: 6, gap: 0.45 },
            ],
            grainTone: "dark",
            grainDensity: 2.8,
            grainSize: 4,
        }),
        shape(BACK_SIDE, random, {
            outline: "ink",
            hatches: [{ tone: "dark", angle: 72, spacing: 2.2 }],
        }),
        ...wood([697, 468], [736, 654], 10, random, true),
        ...wood([712, 648], [1017, 628], 15, random),
        ...wood([733, 600], [700, 730], 12, random, true),
        ...wood([848, 574], [806, 752], 12, random, true),
        ...wood([999, 528], [1024, 743], 12, random),
        ...wood([818, 553], [1009, 525], 14, random),
    ];
}

const UPPER_ARM: Garment = {
    fabric: "knit",
    openSeam: { from: 13, to: 1 },
    grainAngle: 20,
    points: [
        [842, 430],
        [858, 436],
        [868, 452],
        [878, 475],
        [888, 500],
        [896, 520],
        [898, 536],
        [890, 548],
        [876, 549],
        [866, 532],
        [856, 505],
        [846, 478],
        [836, 455],
        [832, 440],
    ],
    shadows: [{ from: 9, to: 13, depth: 13, angle: 60, deep: true }],
    folds: [
        [
            [847, 431],
            [842, 442],
            [838, 452],
        ],
        [
            [852, 474],
            [864, 474],
            [874, 481],
        ],
        [
            [860, 500],
            [874, 499],
            [886, 506],
        ],
        [
            [870, 526],
            [884, 522],
            [895, 528],
        ],
    ],
};

const FOREARM: Garment = {
    fabric: "knit",
    grainAngle: -30,
    points: [
        [872, 546],
        [868, 535],
        [876, 520],
        [888, 505],
        [899, 493],
        [906, 488],
        [924, 489],
        [927, 497],
        [918, 512],
        [906, 528],
        [896, 542],
        [886, 550],
    ],
    shadows: [{ from: 9, to: 11, depth: 9, angle: 20, deep: true }],
    folds: [
        [
            [884, 512],
            [893, 517],
            [900, 526],
        ],
        [
            [877, 526],
            [886, 531],
            [890, 541],
        ],
        [
            [893, 498],
            [903, 503],
            [912, 512],
        ],
    ],
};

const SLEEVE_CUFF: Point[] = [
    [904, 488],
    [926, 487],
    [928, 497],
    [903, 499],
];

export const SHOULDER_PIVOT: Point = [846, 432];
export const ELBOW_PIVOT: Point = [884, 538];
export const WRIST_PIVOT: Point = [913, 492];
export const NECK_PIVOT: Point = [800, 410];
export const KNEE_PIVOT: Point = [1033, 490];

export function drawUpperArm(): Drawing[] {
    return garment(UPPER_ARM, seededRandom(1831));
}

export function drawForearm(): Drawing[] {
    const random = seededRandom(1859);
    return [
        ...garment(FOREARM, random),
        shape(SLEEVE_CUFF, random, {
            outline: "ink",
            hatches: [{ tone: "shade", angle: 80, spacing: 2 }],
        }),
        lines("line", ribTicks([906, 493], [926, 492], 6, 8)),
    ];
}

export function drawMugInHand(): Drawing[] {
    const random = seededRandom(1871);
    const mugBody: Point[] = [
        [925, 458],
        [961, 457],
        [959, 499],
        [950, 503],
        [935, 503],
        [927, 499],
    ];
    const backOfHand: Point[] = [
        [904, 493],
        [902, 483],
        [905, 472],
        [911, 466],
        [918, 463],
        [920, 478],
        [919, 492],
        [912, 497],
    ];
    const thumb: Point[] = [
        [912, 466],
        [919, 459],
        [928, 455],
        [934, 457],
        [930, 462],
        [920, 467],
    ];
    const fingers = [464, 471, 478, 485].map((top, index): Point[] => {
        const reach = 935 - index * 0.8;
        return [
            [916, top],
            [928, top - 0.6],
            [reach, top + 1.4],
            [reach + 0.6, top + 4],
            [reach - 2, top + 6.6],
            [928, top + 7],
            [916, top + 6.6],
        ];
    });
    return [
        shape(
            [
                [926, 466],
                [916, 468],
                [913, 477],
                [916, 486],
                [926, 488],
            ],
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
                    region: [
                        [948, 459],
                        [961, 457],
                        [959, 499],
                        [950, 503],
                        [946, 502],
                    ],
                },
                { tone: "hatch", angle: 88, spacing: 4.2, gap: 0.45 },
            ],
        }),
        shape(ellipse(943, 457, 18, 4.5, 24), random, { outline: "ink", passes: 1 }),
        shape(ellipse(944, 458, 14, 2.8, 20), random, {
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
        lines(
            "soft",
            toPath([
                [907, 476],
                [913, 474],
            ]),
            toPath([
                [906, 484],
                [912, 483],
            ]),
        ),
    ];
}

const CROSSED_SHIN: Garment = {
    fabric: "twill",
    grainAngle: 55,
    points: [
        [1029, 487],
        [1041, 490],
        [1051, 507],
        [1064, 528],
        [1080, 551],
        [1094, 570],
        [1106, 583],
        [1088, 599],
        [1075, 585],
        [1061, 569],
        [1047, 553],
        [1033, 538],
        [1022, 524],
        [1026, 505],
    ],
    shadows: [{ from: 8, to: 12, depth: 13, angle: 50, deep: true }],
    folds: [
        [
            [1046, 505],
            [1060, 528],
            [1076, 553],
        ],
        [
            [1078, 567],
            [1090, 564],
            [1098, 571],
        ],
        [
            [1072, 576],
            [1085, 575],
            [1096, 581],
        ],
    ],
};

const CROSSED_CUFF: Point[] = [
    [1076, 584],
    [1105, 580],
    [1110, 590],
    [1088, 600],
];

const CROSSED_SOCK: Point[] = [
    [1087, 599],
    [1108, 589],
    [1119, 593],
    [1127, 604],
    [1123, 614],
    [1104, 622],
    [1095, 612],
];

const RAISED_SHOE: Sneaker = {
    outline: [
        [1094, 620],
        [1108, 611],
        [1124, 604],
        [1132, 600],
        [1150, 602],
        [1168, 603],
        [1181, 606],
        [1189, 613],
        [1187, 621],
        [1176, 626],
        [1142, 640],
        [1112, 653],
        [1102, 657],
        [1096, 650],
        [1093, 634],
    ],
    shadow: { from: 9, to: 13 },
    sole: [
        [1097, 646],
        [1112, 646],
        [1142, 633],
        [1185, 617],
    ],
    toeCap: [
        [1168, 604],
        [1166, 614],
        [1172, 624],
    ],
    heel: [
        [1104, 617],
        [1100, 634],
        [1104, 650],
    ],
    collar: [
        [1099, 618],
        [1110, 610],
        [1124, 605],
    ],
    laces: [
        [1131, 604],
        [1140, 604],
        [1149, 605],
    ],
};

export function drawCrossedShin(): Drawing[] {
    const random = seededRandom(1876);
    return [
        ...garment(CROSSED_SHIN, random),
        shape(CROSSED_CUFF, random, {
            outline: "ink",
            hatches: [
                { tone: "shade", angle: -35, spacing: 2.4 },
                { tone: "dark", angle: 50, spacing: 3.2, gap: 0.4 },
            ],
        }),
        shape(CROSSED_SOCK, random, {
            smooth: true,
            outline: "line",
            hatches: FABRIC_BASE.rib.map((layer) => ({ ...layer, angle: 60 })),
        }),
        ...sneaker(RAISED_SHOE, random),
    ];
}

export const CUBE_LEFT_FACE: Point[] = [
    [727, 316],
    [793, 295],
    [800, 402],
    [735, 409],
];

export const CUBE_RIGHT_FACE: Point[] = [
    [793, 295],
    [857, 307],
    [862, 398],
    [800, 402],
];

export function drawHead(): Drawing[] {
    const random = seededRandom(1882);
    return [
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

export const STEAM_WISPS = [
    "M938 450C930 436 946 426 937 410C930 398 942 390 938 380",
    "M947 451C955 438 941 428 950 414C957 402 947 394 952 384",
    "M955 452C962 442 954 434 960 424",
];

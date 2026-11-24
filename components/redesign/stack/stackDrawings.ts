import { seededRandom } from "@/lib/seededRandom";

import { lines, shape } from "../sketch/shape";
import {
    between,
    type Drawing,
    ellipse,
    hatch,
    pencilLine,
    type Point,
    type Random,
    toPath,
} from "../sketch/sketch";

export const FIGURE_WIDTH = 600;
export const FIGURE_HEIGHT = 720;

const RADIANS = Math.PI / 180;

const rect = (x0: number, y0: number, x1: number, y1: number): Point[] => [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
];

function arc(
    cx: number,
    cy: number,
    radius: number,
    from: number,
    to: number,
    steps: number,
): Point[] {
    return Array.from({ length: steps + 1 }, (_, index): Point => {
        const angle = (from + ((to - from) * index) / steps) * RADIANS;
        return [cx + Math.cos(angle) * radius, cy - Math.sin(angle) * radius];
    });
}

function rule(a: Point, b: Point, random: Random, tone: "ink" | "line" | "soft" = "soft") {
    return lines(tone, pencilLine([a, b], random, { passes: 1, amplitude: 0.5 }));
}

function shadeBand(region: Point[], random: Random, angle = 0, spacing = 1.8) {
    return lines("shade", hatch(region, random, { angle, spacing, gap: 0.03, bend: 0.2 }));
}

function ashlarWall(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    random: Random,
    course = 34,
    block = 92,
): Drawing[] {
    const drawings: Drawing[] = [];
    const rows = Math.ceil((y1 - y0) / course);
    for (let row = 0; row < rows; row += 1) {
        const top = y0 + row * course;
        const bottom = Math.min(y1, top + course);
        const offset = row % 2 === 0 ? 0 : block / 2;
        for (let x = x0 - offset; x < x1; x += block) {
            const left = Math.max(x0, x);
            const right = Math.min(x1, x + block);
            if (right - left < 10) continue;
            drawings.push(
                shape(rect(left, top, right, bottom), random, {
                    outline: "soft",
                    passes: 1,
                    grainTone: "grain",
                    grainDensity: 0.3,
                    grainSize: 4,
                }),
            );
        }
    }
    return drawings;
}

export const ARCADE_PLAQUES: Point[] = [
    [196, 470],
    [300, 470],
    [404, 470],
];
export const PLAQUE_SIZE = 58;

export function drawArcade(): Drawing[] {
    const random = seededRandom(7101);
    const drawings: Drawing[] = [];
    const ground = 626;
    const left = 36;
    const right = 564;
    const bays = 5;
    const bayWidth = (right - left) / bays;
    const pier = 26;
    const spring = 436;
    const radius = (bayWidth - pier) / 2;

    drawings.push(...ashlarWall(left, 300, right, ground, random));

    for (let bay = 0; bay < bays; bay += 1) {
        const x0 = left + bay * bayWidth + pier / 2;
        const x1 = x0 + bayWidth - pier;
        const cx = (x0 + x1) / 2;
        const opening: Point[] = [
            [x0, ground],
            [x0, spring],
            ...arc(cx, spring, radius, 180, 0, 24),
            [x1, ground],
        ];
        drawings.push(
            shape(opening, random, {
                outline: "ink",
                passes: 1,
                hatches: [
                    { tone: "dark", angle: 62, spacing: 3, gap: 0.05, bend: 0.3 },
                    { tone: "dark", angle: -58, spacing: 3.6, gap: 0.08, bend: 0.3 },
                ],
            }),
        );
        const far = rect(cx - radius * 0.46, spring + 30, cx + radius * 0.46, ground);
        drawings.push(
            shape(far, random, {
                outline: "soft",
                passes: 1,
                hatches: [{ tone: "hatch", angle: 0, spacing: 7, gap: 0.3 }],
            }),
        );
        for (const [ox, oy, fx, fy] of [
            [x0, ground, cx - radius * 0.46, ground],
            [x1, ground, cx + radius * 0.46, ground],
            [x0, spring, cx - radius * 0.46, spring + 30],
            [x1, spring, cx + radius * 0.46, spring + 30],
        ]) {
            drawings.push(rule([ox, oy], [fx, fy], random));
        }
        const archRing: Point[] = [
            ...arc(cx, spring, radius, 180, 0, 24),
            ...arc(cx, spring, radius + 16, 0, 180, 24),
        ];
        drawings.push(
            shape(archRing, random, {
                outline: "line",
                passes: 1,
                grainTone: "grain",
                grainDensity: 0.5,
                grainSize: 4,
            }),
        );
        for (let stone = 0; stone <= 9; stone += 1) {
            const angle = 180 - stone * 20;
            drawings.push(
                rule(
                    arc(cx, spring, radius, angle, angle, 1)[0],
                    arc(cx, spring, radius + 16, angle, angle, 1)[0],
                    random,
                    "line",
                ),
            );
        }
        const keystone: Point[] = [
            [cx - 9, spring - radius - 24],
            [cx + 9, spring - radius - 24],
            [cx + 6, spring - radius + 6],
            [cx - 6, spring - radius + 6],
        ];
        drawings.push(shape(keystone, random, { outline: "line", passes: 1 }));
        const impost = rect(x0 - 6, spring - 10, x1 + 6, spring);
        drawings.push(
            shape(impost, random, { outline: "line", passes: 1 }),
            shadeBand(rect(x0 - 6, spring - 3, x1 + 6, spring), random),
        );
    }
    for (let bay = 0; bay <= bays; bay += 1) {
        const x = left + bay * bayWidth;
        const pilaster = rect(x - pier / 2, 340, x + pier / 2, ground);
        drawings.push(
            shape(pilaster, random, {
                outline: "line",
                passes: 1,
                grainTone: "grain",
                grainDensity: 0.4,
                grainSize: 4,
                hatches: [
                    {
                        tone: "shade",
                        angle: 90,
                        spacing: 2.2,
                        gap: 0.05,
                        region: rect(x + pier / 2 - 5, 340, x + pier / 2, ground),
                    },
                ],
            }),
        );
        drawings.push(
            shape(rect(x - pier / 2 - 4, 330, x + pier / 2 + 4, 342), random, {
                outline: "line",
                passes: 1,
            }),
        );
    }
    const architrave = rect(left - 10, 300, right + 10, 330);
    drawings.push(
        shape(architrave, random, { outline: "ink", passes: 1 }),
        rule([left - 10, 312], [right + 10, 312], random),
        shadeBand(rect(left - 10, 325, right + 10, 330), random),
    );
    const cornice = rect(left - 20, 270, right + 20, 300);
    drawings.push(
        shape(cornice, random, { outline: "ink", passes: 2 }),
        rule([left - 20, 280], [right + 20, 280], random),
        shadeBand(rect(left - 20, 294, right + 20, 300), random),
    );
    for (let x = left - 10; x < right + 10; x += 22) {
        drawings.push(shape(rect(x, 300, x + 12, 310), random, { outline: "soft", passes: 1 }));
    }
    const parapetTop = 226;
    drawings.push(
        shape(rect(left - 12, parapetTop, right + 12, parapetTop + 12), random, {
            outline: "ink",
            passes: 1,
        }),
    );
    for (let x = left + 10; x < right; x += 24) {
        const baluster: Point[] = [
            [x - 5, 270],
            [x + 5, 270],
            [x + 4, 258],
            [x + 7, 250],
            [x + 3, 240],
            [x - 3, 240],
            [x - 7, 250],
            [x - 4, 258],
        ];
        drawings.push(
            shape(baluster, random, {
                outline: "soft",
                passes: 1,
                smooth: true,
                hatches: [
                    {
                        tone: "hatch",
                        angle: 90,
                        spacing: 2.5,
                        gap: 0.2,
                        region: [
                            [x, 240],
                            [x + 7, 250],
                            [x + 5, 270],
                            [x, 270],
                        ],
                    },
                ],
            }),
        );
    }
    const steps = [
        [ground, ground + 16],
        [ground + 16, ground + 32],
    ];
    steps.forEach(([top, bottom], index) => {
        const inset = 14 - index * 14;
        drawings.push(
            shape(rect(left + inset - 20, top, right - inset + 20, bottom), random, {
                outline: "ink",
                passes: 1,
            }),
            shadeBand(rect(left + inset - 20, bottom - 4, right - inset + 20, bottom), random),
        );
    });
    drawings.push(rule([0, ground + 32], [FIGURE_WIDTH, ground + 32], random, "ink"));
    for (const y of [ground + 48, ground + 66])
        drawings.push(rule([0, y], [FIGURE_WIDTH, y], random));
    for (const [px, py] of ARCADE_PLAQUES) {
        const half = PLAQUE_SIZE / 2;
        drawings.push(rule([px, spring - radius + 8], [px, py - half], random, "line"));
        drawings.push(
            shape(rect(px - half, py - half, px + half, py + half), random, {
                outline: "ink",
                passes: 1,
            }),
        );
        drawings.push(
            lines(
                "soft",
                pencilLine(
                    rect(px - half + 5, py - half + 5, px + half - 5, py + half - 5),
                    random,
                    { closed: true, passes: 1, amplitude: 0.4 },
                ),
            ),
        );
        drawings.push(shadeBand(rect(px - half, py + half - 3, px + half, py + half), random));
    }
    return drawings;
}

export function drawChamber(): Drawing[] {
    const random = seededRandom(7202);
    const drawings: Drawing[] = [];
    const outer = { x0: 30, y0: 50, x1: 570, y1: 670 };
    const back = { x0: 196, y0: 232, x1: 404, y1: 456 };
    const vanish: Point = [300, 372];

    drawings.push(
        shape(rect(outer.x0, outer.y0, outer.x1, outer.y1), random, { outline: "ink", passes: 1 }),
    );
    drawings.push(
        shape(rect(back.x0, back.y0, back.x1, back.y1), random, {
            outline: "ink",
            passes: 1,
            grainTone: "grain",
            grainDensity: 0.3,
            grainSize: 4,
        }),
    );
    for (const [ox, oy, bx, by] of [
        [outer.x0, outer.y0, back.x0, back.y0],
        [outer.x1, outer.y0, back.x1, back.y0],
        [outer.x0, outer.y1, back.x0, back.y1],
        [outer.x1, outer.y1, back.x1, back.y1],
    ]) {
        drawings.push(rule([ox, oy], [bx, by], random, "ink"));
    }
    const towards = (from: Point, t: number): Point => [
        from[0] + (vanish[0] - from[0]) * t,
        from[1] + (vanish[1] - from[1]) * t,
    ];
    const depth = (back.y0 - outer.y0) / (vanish[1] - outer.y0);
    const floorLines: string[] = [];
    for (let column = 0; column <= 8; column += 1) {
        const x = outer.x0 + ((outer.x1 - outer.x0) * column) / 8;
        const end = towards([x, outer.y1], depth);
        floorLines.push(toPath([[x, outer.y1], end]));
        const ceilingEnd = towards([x, outer.y0], depth);
        floorLines.push(toPath([[x, outer.y0], ceilingEnd]));
    }
    for (let row = 1; row < 9; row += 1) {
        const t = 1 - Math.pow(1 - row / 9, 1.9);
        const tt = t * depth;
        const a = towards([outer.x0, outer.y1], tt);
        const b = towards([outer.x1, outer.y1], tt);
        floorLines.push(toPath([a, b]));
        const c = towards([outer.x0, outer.y0], tt);
        const d = towards([outer.x1, outer.y0], tt);
        floorLines.push(toPath([c, d]));
        const e = towards([outer.x0, outer.y0], tt);
        const f = towards([outer.x0, outer.y1], tt);
        floorLines.push(toPath([e, f]));
        const g = towards([outer.x1, outer.y0], tt);
        const h = towards([outer.x1, outer.y1], tt);
        floorLines.push(toPath([g, h]));
    }
    drawings.push(lines("soft", ...floorLines));
    const leftWall: Point[] = [
        [outer.x0, outer.y0],
        [back.x0, back.y0],
        [back.x0, back.y1],
        [outer.x0, outer.y1],
    ];
    const rightWall: Point[] = [
        [back.x1, back.y0],
        [outer.x1, outer.y0],
        [outer.x1, outer.y1],
        [back.x1, back.y1],
    ];
    drawings.push(
        lines("hatch", hatch(leftWall, random, { angle: 70, spacing: 6, gap: 0.3, bend: 0.3 })),
    );
    drawings.push(
        lines("shade", hatch(rightWall, random, { angle: -70, spacing: 3.4, gap: 0.1, bend: 0.3 })),
    );
    const ceiling: Point[] = [
        [outer.x0, outer.y0],
        [outer.x1, outer.y0],
        [back.x1, back.y0],
        [back.x0, back.y0],
    ];
    drawings.push(
        lines("hatch", hatch(ceiling, random, { angle: 0, spacing: 6, gap: 0.3, bend: 0.3 })),
    );
    const doorX0 = 268;
    const doorX1 = 332;
    const door = rect(doorX0, 296, doorX1, back.y1);
    drawings.push(
        shape(door, random, {
            outline: "ink",
            passes: 1,
            hatches: [{ tone: "hatch", angle: 90, spacing: 3, gap: 0.2 }],
        }),
    );
    drawings.push(
        lines(
            "line",
            pencilLine(rect(doorX0 + 8, 306, doorX1 - 8, 360), random, {
                closed: true,
                passes: 1,
                amplitude: 0.4,
            }),
            pencilLine(rect(doorX0 + 8, 372, doorX1 - 8, back.y1 - 12), random, {
                closed: true,
                passes: 1,
                amplitude: 0.4,
            }),
        ),
    );
    drawings.push(lines("ink", toPath(ellipse(doorX1 - 14, 380, 2.5, 2.5, 8), true)));
    drawings.push(
        shape(rect(doorX0 - 8, 288, doorX1 + 8, 296), random, { outline: "line", passes: 1 }),
    );
    drawings.push(
        shape(rect(doorX0 - 2, 254, doorX1 + 2, 274), random, { outline: "line", passes: 1 }),
    );
    const benchTop: Point[] = [
        [200, 560],
        [400, 560],
        [372, 520],
        [228, 520],
    ];
    drawings.push(
        shape(benchTop, random, {
            outline: "ink",
            passes: 1,
            hatches: [{ tone: "hatch", angle: 0, spacing: 5, gap: 0.4, trim: 20 }],
        }),
    );
    const benchFront = rect(200, 560, 400, 574);
    drawings.push(
        shape(benchFront, random, { outline: "ink", passes: 1 }),
        shadeBand(rect(200, 569, 400, 574), random),
    );
    for (const [lx0, lx1] of [
        [206, 216],
        [384, 394],
    ]) {
        drawings.push(
            shape(rect(lx0, 574, lx1, 636), random, {
                outline: "ink",
                passes: 1,
                hatches: [
                    {
                        tone: "shade",
                        angle: 90,
                        spacing: 2,
                        gap: 0.05,
                        region: rect(lx1 - 3, 574, lx1, 636),
                    },
                ],
            }),
        );
    }
    for (const [lx0, lx1] of [
        [232, 240],
        [360, 368],
    ]) {
        drawings.push(shape(rect(lx0, 520, lx1, 560), random, { outline: "line", passes: 1 }));
    }
    const crate = rect(262, 476, 338, 520);
    drawings.push(
        shape(crate, random, {
            outline: "ink",
            passes: 1,
            grainTone: "grain",
            grainDensity: 0.5,
            grainSize: 5,
            hatches: [{ tone: "hatch", angle: 0, spacing: 4.5, gap: 0.4, trim: 10 }],
        }),
    );
    drawings.push(
        lines(
            "line",
            toPath([
                [262, 490],
                [338, 490],
            ]),
        ),
    );
    const lamp: Point[] = [
        [300, 50],
        [300, 110],
    ];
    drawings.push(rule(lamp[0], lamp[1], random, "ink"));
    const lampShade: Point[] = [
        [258, 136],
        [342, 136],
        [322, 110],
        [278, 110],
    ];
    drawings.push(
        shape(lampShade, random, {
            outline: "ink",
            passes: 1,
            hatches: [{ tone: "dark", angle: 0, spacing: 2.2, gap: 0.05, bend: 0.3 }],
        }),
    );
    const glow: Point[] = [
        [258, 140],
        [342, 140],
        [420, 470],
        [180, 470],
    ];
    drawings.push(
        lines(
            "hatch",
            hatch(glow, random, { angle: 90, spacing: 11, gap: 0.5, trim: 40, bend: 0.4 }),
        ),
    );
    return drawings;
}

export const KEY_HOOK: Point = [528, 392];

export function drawDoor(): Drawing[] {
    const random = seededRandom(7303);
    const drawings: Drawing[] = [];
    const ground = 668;
    drawings.push(...ashlarWall(0, 40, FIGURE_WIDTH, 600, random, 40, 110));
    const stepRows = [
        [600, 624],
        [624, 648],
        [648, ground],
    ];
    stepRows.forEach(([top, bottom], index) => {
        const inset = 90 - index * 30;
        drawings.push(
            shape(rect(inset, top, FIGURE_WIDTH - inset, bottom), random, {
                outline: "ink",
                passes: 1,
            }),
            shadeBand(rect(inset, bottom - 5, FIGURE_WIDTH - inset, bottom), random),
        );
    });
    drawings.push(rule([0, ground], [FIGURE_WIDTH, ground], random, "ink"));
    const doorX0 = 196;
    const doorX1 = 404;
    const doorTop = 318;
    const doorBottom = 600;
    const fanSpring = doorTop;
    const fanRadius = (doorX1 - doorX0) / 2;
    const cx = (doorX0 + doorX1) / 2;
    const surround: Point[] = [
        [doorX0 - 14, doorBottom],
        [doorX0 - 14, fanSpring],
        ...arc(cx, fanSpring, fanRadius + 14, 180, 0, 24),
        [doorX1 + 14, doorBottom],
    ];
    drawings.push(shape(surround, random, { outline: "ink", passes: 1 }));
    const fan: Point[] = [
        [doorX0, fanSpring],
        ...arc(cx, fanSpring, fanRadius, 180, 0, 24),
        [doorX1, fanSpring],
    ];
    drawings.push(
        shape(fan, random, {
            outline: "ink",
            passes: 1,
            hatches: [{ tone: "hatch", angle: 55, spacing: 3.2, gap: 0.15, bend: 0.2 }],
        }),
    );
    for (let spoke = 1; spoke < 6; spoke += 1) {
        const angle = 180 - spoke * 30;
        drawings.push(
            rule(
                [cx, fanSpring],
                arc(cx, fanSpring, fanRadius, angle, angle, 1)[0],
                random,
                "line",
            ),
        );
    }
    drawings.push(
        lines(
            "line",
            pencilLine(arc(cx, fanSpring, fanRadius * 0.55, 180, 0, 20), random, {
                passes: 1,
                amplitude: 0.5,
            }),
        ),
    );
    drawings.push(
        shape(rect(doorX0 - 4, doorTop - 6, doorX1 + 4, doorTop + 8), random, {
            outline: "ink",
            passes: 1,
        }),
        shadeBand(rect(doorX0 - 4, doorTop + 4, doorX1 + 4, doorTop + 8), random),
    );
    const doorFace = rect(doorX0, doorTop + 8, doorX1, doorBottom);
    drawings.push(
        shape(doorFace, random, {
            outline: "ink",
            passes: 2,
            grainTone: "grain",
            grainDensity: 0.4,
            grainSize: 6,
            hatches: [{ tone: "hatch", angle: 90, spacing: 5, gap: 0.5, trim: 30, bend: 0.2 }],
        }),
    );
    const panelColumns = [
        [doorX0 + 16, cx - 8],
        [cx + 8, doorX1 - 16],
    ];
    const panelRows = [
        [doorTop + 24, doorTop + 92],
        [doorTop + 108, doorTop + 196],
        [doorTop + 212, doorBottom - 20],
    ];
    for (const [px0, px1] of panelColumns) {
        for (const [py0, py1] of panelRows) {
            drawings.push(shape(rect(px0, py0, px1, py1), random, { outline: "line", passes: 1 }));
            drawings.push(
                lines(
                    "soft",
                    pencilLine(rect(px0 + 7, py0 + 7, px1 - 7, py1 - 7), random, {
                        closed: true,
                        passes: 1,
                        amplitude: 0.4,
                    }),
                ),
            );
            drawings.push(
                shadeBand(
                    [
                        [px0, py1],
                        [px1, py1],
                        [px1 - 7, py1 - 7],
                        [px0 + 7, py1 - 7],
                    ],
                    random,
                    0,
                    1.6,
                ),
            );
            drawings.push(
                shadeBand(
                    [
                        [px1, py0],
                        [px1, py1],
                        [px1 - 7, py1 - 7],
                        [px1 - 7, py0 + 7],
                    ],
                    random,
                    90,
                    1.6,
                ),
            );
        }
    }
    const leafCenter = (doorX0 + 16 + cx - 8) / 2;
    const knobY = doorTop + 150;
    drawings.push(
        shape(ellipse(cx, knobY, 7, 7, 14), random, {
            outline: "ink",
            passes: 1,
            smooth: true,
            hatches: [{ tone: "shade", angle: 45, spacing: 2, gap: 0.1 }],
        }),
    );
    const escutcheon: Point[] = [
        [cx, knobY + 20],
        [cx + 5, knobY + 28],
        [cx + 3, knobY + 44],
        [cx - 3, knobY + 44],
        [cx - 5, knobY + 28],
    ];
    drawings.push(shape(escutcheon, random, { outline: "ink", passes: 1, smooth: true }));
    drawings.push(
        shape(ellipse(cx, knobY + 28, 2.5, 2.5, 10), random, {
            outline: "ink",
            passes: 1,
            smooth: true,
            hatches: [{ tone: "dark", angle: 0, spacing: 1.4, gap: 0 }],
        }),
    );
    drawings.push(
        lines(
            "ink",
            toPath(
                [
                    [cx - 1, knobY + 30],
                    [cx - 1, knobY + 38],
                    [cx + 1, knobY + 38],
                    [cx + 1, knobY + 30],
                ],
                true,
            ),
        ),
    );
    drawings.push(
        shape(rect(leafCenter - 30, doorTop + 200, leafCenter + 30, doorTop + 208), random, {
            outline: "ink",
            passes: 1,
            hatches: [{ tone: "dark", angle: 0, spacing: 1.6, gap: 0 }],
        }),
    );
    for (const px of [doorX0 - 50, doorX1 + 50]) {
        const pilaster = rect(px - 18, 300, px + 18, doorBottom);
        drawings.push(
            shape(pilaster, random, {
                outline: "ink",
                passes: 1,
                grainTone: "grain",
                grainDensity: 0.35,
                grainSize: 4,
                hatches: [
                    {
                        tone: "shade",
                        angle: 90,
                        spacing: 2.2,
                        gap: 0.05,
                        region: rect(px + 12, 300, px + 18, doorBottom),
                    },
                ],
            }),
        );
        drawings.push(
            shape(rect(px - 24, 284, px + 24, 300), random, { outline: "ink", passes: 1 }),
        );
        drawings.push(
            shape(rect(px - 22, doorBottom - 24, px + 22, doorBottom), random, {
                outline: "line",
                passes: 1,
            }),
        );
        for (let flute = -10; flute <= 10; flute += 10) {
            drawings.push(rule([px + flute, 312], [px + flute, doorBottom - 30], random));
        }
    }
    const entablature = rect(doorX0 - 100, 236, doorX1 + 100, 284);
    drawings.push(
        shape(entablature, random, { outline: "ink", passes: 2 }),
        rule([doorX0 - 100, 252], [doorX1 + 100, 252], random, "line"),
        rule([doorX0 - 100, 268], [doorX1 + 100, 268], random),
        shadeBand(rect(doorX0 - 100, 279, doorX1 + 100, 284), random),
    );
    const pediment: Point[] = [
        [doorX0 - 110, 236],
        [cx, 160],
        [doorX1 + 110, 236],
    ];
    drawings.push(
        shape(pediment, random, {
            outline: "ink",
            passes: 2,
            grainTone: "grain",
            grainDensity: 0.3,
            grainSize: 4,
        }),
    );
    drawings.push(
        lines(
            "line",
            pencilLine(
                [
                    [doorX0 - 84, 226],
                    [cx, 176],
                    [doorX1 + 84, 226],
                ],
                random,
                { passes: 1, amplitude: 0.5 },
            ),
            toPath([
                [doorX0 - 84, 226],
                [doorX1 + 84, 226],
            ]),
        ),
    );
    const lanternX = doorX0 - 50;
    const lantern: Point[] = [
        [lanternX - 14, 372],
        [lanternX + 14, 372],
        [lanternX + 10, 420],
        [lanternX - 10, 420],
    ];
    drawings.push(rule([lanternX, 352], [lanternX, 372], random, "ink"));
    drawings.push(
        shape(
            [
                [lanternX - 10, 352],
                [lanternX + 10, 352],
                [lanternX, 342],
            ],
            random,
            { outline: "ink", passes: 1 },
        ),
    );
    drawings.push(
        shape(lantern, random, {
            outline: "ink",
            passes: 1,
            hatches: [{ tone: "hatch", angle: 60, spacing: 3, gap: 0.2 }],
        }),
    );
    drawings.push(
        lines(
            "soft",
            toPath([
                [lanternX, 372],
                [lanternX, 420],
            ]),
            toPath([
                [lanternX - 12, 396],
                [lanternX + 12, 396],
            ]),
        ),
    );
    const [hx, hy] = KEY_HOOK;
    drawings.push(
        shape(ellipse(hx, hy, 4, 4, 10), random, { outline: "ink", passes: 1, smooth: true }),
    );
    drawings.push(
        lines(
            "ink",
            pencilLine(
                [
                    [hx, hy + 4],
                    [hx, hy + 14],
                    [hx + 6, hy + 20],
                ],
                random,
                { passes: 1, amplitude: 0.3 },
            ),
        ),
    );
    const bow = ellipse(hx + 6, hy + 34, 13, 13, 18);
    drawings.push(shape(bow, random, { outline: "ink", passes: 2, smooth: true }));
    drawings.push(
        shape(ellipse(hx + 6, hy + 34, 5, 5, 12), random, {
            outline: "line",
            passes: 1,
            smooth: true,
            fill: false,
        }),
    );
    drawings.push(
        shape(rect(hx + 3, hy + 46, hx + 9, hy + 108), random, {
            outline: "ink",
            passes: 1,
            hatches: [
                {
                    tone: "shade",
                    angle: 90,
                    spacing: 1.8,
                    gap: 0,
                    region: rect(hx + 6, hy + 46, hx + 9, hy + 108),
                },
            ],
        }),
    );
    const bits: Point[] = [
        [hx + 9, hy + 86],
        [hx + 22, hy + 86],
        [hx + 22, hy + 94],
        [hx + 16, hy + 94],
        [hx + 16, hy + 100],
        [hx + 24, hy + 100],
        [hx + 24, hy + 108],
        [hx + 9, hy + 108],
    ];
    drawings.push(
        shape(bits, random, {
            outline: "ink",
            passes: 1,
            hatches: [{ tone: "shade", angle: 0, spacing: 1.8, gap: 0.05 }],
        }),
    );
    return drawings;
}

export function registrationMarks(random: Random, count = 3): Point[] {
    return Array.from({ length: count }, (): Point => [
        between(random, 40, FIGURE_WIDTH - 40),
        between(random, 60, FIGURE_HEIGHT - 60),
    ]);
}

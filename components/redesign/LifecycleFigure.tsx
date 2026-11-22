"use client";

import { useAnimationFrame, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef } from "react";

const LIFESPAN = 5.4;
const SEGMENT_COUNT = 8;
const SEGMENTS = Array.from({ length: SEGMENT_COUNT }, (_, index) => index);
const PUPA_BASE = { x: 60, y: 74 };
const PUPA_TILT = 20;
const PUPA_LENGTH = 34;
const PUPA_TIP = {
    x: PUPA_BASE.x + PUPA_LENGTH * Math.sin((PUPA_TILT * Math.PI) / 180),
    y: PUPA_BASE.y - PUPA_LENGTH * Math.cos((PUPA_TILT * Math.PI) / 180),
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const progress = (time: number, from: number, to: number) => clamp01((time - from) / (to - from));
const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;
const easeInOut = (value: number) => (value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2);
const easeOut = (value: number) => 1 - (1 - value) ** 3;
const backOut = (value: number) => 1 + 2.4 * (value - 1) ** 3 + 1.4 * (value - 1) ** 2;
const envelope = (value: number) => Math.sin(value * Math.PI);

type Figure = {
    warmth: SVGRectElement;
    bloom: SVGRectElement;
    egg: SVGGElement;
    crack: SVGPathElement;
    larva: SVGGElement;
    segments: SVGGElement[];
    pupa: SVGGElement;
    pupaShell: SVGPathElement;
    pupaShade: SVGPathElement;
    butterfly: SVGGElement;
    wings: SVGGElement;
};

function drawEgg(figure: Figure, time: number) {
    const rock = progress(time, 0, 0.75);
    const angle = 7 * Math.sin(rock * Math.PI * 3) * envelope(rock);
    const hatch = easeOut(progress(time, 0.9, 1.3));
    figure.egg.setAttribute(
        "transform",
        `rotate(${angle} 50 74) translate(50 74) scale(${1 + 0.12 * hatch}) translate(-50 -74)`,
    );
    figure.egg.style.opacity = String(1 - hatch);
    figure.crack.style.strokeDashoffset = String(1 - easeOut(progress(time, 0.55, 0.95)));
}

function drawLarva(figure: Figure, time: number) {
    const growth = easeInOut(progress(time, 1, 2.9));
    const appear = easeOut(progress(time, 0.95, 1.3));
    const pupation = easeInOut(progress(time, 2.9, 3.7));
    const count = 2 + (SEGMENT_COUNT - 2) * growth;
    const radius = 2.2 + 2.6 * growth;
    const spacing = radius * 1.5;
    const headX = 51 + 21 * growth;
    const crawl = time * 1.5;
    const axis = (PUPA_TILT * Math.PI) / 180;

    figure.larva.style.opacity = String(appear * (1 - progress(time, 3.45, 3.8)));

    figure.segments.forEach((segment, index) => {
        const presence = easeOut(clamp01(count - index));
        const wave = Math.max(0, Math.sin(2 * Math.PI * (crawl - index / 7))) ** 2;
        const lift = radius * 0.6 * wave * (1 - pupation);
        const crawlX = headX - index * spacing;
        const crawlY = PUPA_BASE.y - radius - lift;

        const height = 1 - index / (SEGMENT_COUNT - 1);
        const along = 4 + (PUPA_LENGTH - 8) * height;
        const pupaX = PUPA_BASE.x + along * Math.sin(axis);
        const pupaY = PUPA_BASE.y - along * Math.cos(axis);
        const pupaRadius = 1.4 + 3.6 * Math.sin(Math.PI * (0.12 + 0.76 * height));

        const x = lerp(crawlX, pupaX, pupation);
        const y = lerp(crawlY, pupaY, pupation);
        const size = lerp(radius * presence, pupaRadius, pupation);

        segment.setAttribute("transform", `translate(${x} ${y}) scale(${Math.max(size, 0.001)})`);
        segment.style.opacity = presence > 0.001 || pupation > 0 ? "1" : "0";
    });
}

function drawPupa(figure: Figure, time: number) {
    const arrival = progress(time, 3.3, 3.75);
    const twitchProgress = progress(time, 3.75, 4.3);
    const twitch = 5 * Math.sin(twitchProgress * Math.PI * 4) * envelope(twitchProgress);
    const eclosion = easeInOut(progress(time, 4.3, 4.75));

    figure.pupa.setAttribute(
        "transform",
        `translate(${PUPA_BASE.x} ${PUPA_BASE.y}) rotate(${PUPA_TILT + twitch})`,
    );
    figure.pupa.style.opacity = String(arrival * (1 - eclosion));
    figure.pupaShell.style.strokeDashoffset = String(1 - easeOut(arrival));
    figure.pupaShell.style.fillOpacity = String(easeInOut(progress(time, 3.5, 3.85)));
    figure.pupaShade.style.opacity = String(
        0.6 * easeInOut(progress(time, 3.85, 4.3)) * (1 - eclosion),
    );
}

function drawButterfly(figure: Figure, time: number) {
    const emerge = easeOut(progress(time, 4.3, 4.7));
    const travel = easeInOut(progress(time, 4.4, 5.3));
    const unfold = progress(time, 4.55, LIFESPAN);
    const x = lerp(PUPA_TIP.x, 50, travel);
    const y = lerp(PUPA_TIP.y, 45, travel);
    const tilt = PUPA_TILT * (1 - travel);
    const size = 0.55 + 0.45 * easeOut(progress(time, 4.3, 5));
    const open = 0.05 + 0.95 * backOut(unfold);
    const lift = 0.45 + 0.55 * easeOut(unfold);

    figure.butterfly.setAttribute(
        "transform",
        `translate(${x} ${y}) rotate(${tilt}) scale(${size})`,
    );
    figure.butterfly.style.opacity = String(emerge);
    figure.wings.setAttribute("transform", `scale(${open} ${lift})`);
}

function drawFigure(figure: Figure, time: number) {
    figure.warmth.style.opacity = String(easeInOut(progress(time, 1, 2.9)));
    figure.bloom.style.opacity = String(0.6 * easeInOut(progress(time, 4.4, 5.3)));
    drawEgg(figure, time);
    drawLarva(figure, time);
    drawPupa(figure, time);
    drawButterfly(figure, time);
}

const FOREWING = "M1 -2 C 8 -14, 22 -22, 33 -20 C 34 -14, 28 -6, 18 -1 C 10 1, 4 1, 1 0 Z";
const HINDWING = "M1 1 C 8 2, 18 4, 22 10 C 23 15, 19 19, 14 19 L 13 26 L 10 19 C 6 16, 2 9, 1 3 Z";
const WING_SPOTS = [
    [29, -17, 1.3],
    [31, -12.5, 1.1],
    [27, -7, 1],
    [19, 15, 1.2],
    [21, 10.5, 1],
] as const;
const PUPA_OUTLINE =
    "M0 0 C -6 -6, -7 -18, -3 -28 C -2 -31, -1 -33, 0 -34 C 1 -33, 2 -31, 3 -28 C 7 -18, 6 -6, 0 0 Z";

function Wing() {
    return (
        <g>
            <path d={FOREWING} className="fill-stone-900" />
            <path d={HINDWING} className="fill-stone-900" />
            <path
                d="M2 -1 C 10 -8, 20 -14, 30 -17 M2 2 C 9 5, 15 9, 19 14"
                className="fill-none stroke-paper/40"
                strokeWidth={0.6}
            />
            {WING_SPOTS.map(([x, y, radius]) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r={radius} className="fill-amber-100" />
            ))}
        </g>
    );
}

export default function LifecycleFigure({ playing }: { playing: boolean }) {
    const reduceMotion = useReducedMotion();
    const svgRef = useRef<SVGSVGElement>(null);
    const figureRef = useRef<Figure | null>(null);
    const clock = useRef({ time: 0, drawn: -1 });
    const playingRef = useRef(playing);

    useLayoutEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;
        const pick = <T extends Element>(name: string) =>
            svg.querySelector(`[data-part="${name}"]`) as T;
        figureRef.current = {
            warmth: pick("warmth"),
            bloom: pick("bloom"),
            egg: pick("egg"),
            crack: pick("crack"),
            larva: pick("larva"),
            segments: Array.from(svg.querySelectorAll<SVGGElement>('[data-part="segment"]')).sort(
                (first, second) => Number(first.dataset.index) - Number(second.dataset.index),
            ),
            pupa: pick("pupa"),
            pupaShell: pick("pupa-shell"),
            pupaShade: pick("pupa-shade"),
            butterfly: pick("butterfly"),
            wings: pick("wings"),
        };
        drawFigure(figureRef.current, 0);
    }, []);

    useEffect(() => {
        playingRef.current = playing;
        if (!reduceMotion || !figureRef.current) return;
        clock.current.time = playing ? LIFESPAN : 0;
        drawFigure(figureRef.current, clock.current.time);
    }, [playing, reduceMotion]);

    useAnimationFrame((_, delta) => {
        const figure = figureRef.current;
        if (!figure || reduceMotion) return;
        const state = clock.current;
        const seconds = Math.min(delta, 50) / 1000;
        if (playingRef.current) state.time = Math.min(LIFESPAN, state.time + seconds);
        if (state.drawn === state.time) return;
        drawFigure(figure, state.time);
        state.drawn = state.time;
    });

    return (
        <svg
            ref={svgRef}
            viewBox="0 0 100 100"
            aria-hidden
            className="absolute inset-0 size-full overflow-visible"
        >
            <rect
                data-part="warmth"
                width="100"
                height="100"
                className="fill-red-200"
                opacity={0}
            />
            <rect data-part="bloom" width="100" height="100" className="fill-red-300" opacity={0} />

            <path
                d="M4 75 C 30 73, 70 77, 96 74"
                className="fill-none stroke-stone-800"
                strokeWidth={1.4}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
            />

            <g data-part="egg">
                <ellipse
                    cx={50}
                    cy={64}
                    rx={8}
                    ry={10}
                    className="fill-paper stroke-stone-900"
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                />
                <path
                    d="M46 57 C 45 62, 45 67, 46.5 71 M50 54.5 C 50 61, 50 67, 50 73.5 M54 57 C 55 62, 55 67, 53.5 71"
                    className="fill-none stroke-stone-400"
                    strokeWidth={0.8}
                    vectorEffect="non-scaling-stroke"
                />
                <path
                    data-part="crack"
                    d="M42.5 62 L 45.5 59.5 L 48 63 L 51 59 L 53.5 62.5 L 57.5 60.5"
                    pathLength={1}
                    strokeDasharray="1 1"
                    strokeDashoffset={1}
                    className="fill-none stroke-stone-900"
                    strokeWidth={1}
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                />
            </g>

            <g data-part="larva" opacity={0}>
                {SEGMENTS.toReversed().map((index) => (
                    <g key={index} data-part="segment" data-index={index}>
                        <circle
                            r={1}
                            className={
                                index === 0 ? "fill-stone-900" : "fill-paper stroke-stone-900"
                            }
                            strokeWidth={1}
                            vectorEffect="non-scaling-stroke"
                        />
                        {index > 0 && (
                            <path
                                d="M-0.25 -0.95 L -0.25 0.45"
                                className="stroke-stone-900"
                                strokeWidth={0.42}
                            />
                        )}
                    </g>
                ))}
            </g>

            <g data-part="pupa" opacity={0}>
                <path
                    data-part="pupa-shell"
                    d={PUPA_OUTLINE}
                    pathLength={1}
                    strokeDasharray="1 1"
                    className="fill-stone-100 stroke-stone-900"
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                />
                <path
                    data-part="pupa-shade"
                    d={PUPA_OUTLINE}
                    className="fill-stone-700"
                    opacity={0}
                />
                <path
                    d="M-6 -11 Q 0 -8, 6 -11"
                    className="fill-none stroke-stone-500"
                    strokeWidth={0.8}
                    vectorEffect="non-scaling-stroke"
                />
            </g>

            <g data-part="butterfly" opacity={0}>
                <g data-part="wings">
                    <Wing />
                    <g transform="scale(-1 1)">
                        <Wing />
                    </g>
                </g>
                <ellipse rx={1.7} ry={9} className="fill-stone-900" />
                <circle cy={-10} r={1.9} className="fill-stone-900" />
                <path
                    d="M-0.6 -11 Q -4 -18, -6.5 -21 M0.6 -11 Q 4 -18, 6.5 -21"
                    className="fill-none stroke-stone-900"
                    strokeWidth={0.8}
                    strokeLinecap="round"
                />
                <circle cx={-6.5} cy={-21} r={0.9} className="fill-stone-900" />
                <circle cx={6.5} cy={-21} r={0.9} className="fill-stone-900" />
            </g>
        </svg>
    );
}

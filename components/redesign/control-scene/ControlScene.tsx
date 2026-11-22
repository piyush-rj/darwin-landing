"use client";

import { MotionConfig, useAnimationFrame, useReducedMotion, type Variants } from "motion/react";
import * as m from "motion/react-m";
import { type RefObject, useRef } from "react";

import { DARWIN_LOGO_BRAND_COLOR, DarwinBlockLogo } from "@/components/logo/DarwinBlockLogo";

import {
    drawCrossedShin,
    drawForearm,
    drawHead,
    drawMugInHand,
    drawSeatedFigure,
    drawUpperArm,
    ELBOW_PIVOT,
    KNEE_PIVOT,
    NECK_PIVOT,
    SHOULDER_PIVOT,
    STEAM_WISPS,
    WRIST_PIVOT,
} from "./figureDrawing";
import type { Drawing, Tone } from "./sketch";
import { drawFloor, drawWall, GRAIN_TILES } from "./wallDrawing";

const SCENE_WIDTH = 1916;
const SCENE_HEIGHT = 821;
const VIEW_BOX = `0 0 ${SCENE_WIDTH} ${SCENE_HEIGHT}`;
const CUBE_FACE_MATRIX = "matrix(62.3 14.3 7.3 106 792.7 294)";
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const TONE_STYLE: Record<Tone, { width: number; opacity: number }> = {
    ink: { width: 2, opacity: 0.86 },
    line: { width: 1.35, opacity: 0.7 },
    soft: { width: 1, opacity: 0.46 },
    hatch: { width: 0.75, opacity: 0.32 },
    shade: { width: 0.85, opacity: 0.5 },
    dark: { width: 0.9, opacity: 0.72 },
    grain: { width: 0.7, opacity: 0.3 },
};

const STATIC_DRAWINGS = [...drawFloor(), ...drawWall(), ...drawSeatedFigure()];
const UPPER_ARM = drawUpperArm();
const FOREARM = drawForearm();
const MUG_IN_HAND = drawMugInHand();
const CROSSED_SHIN = drawCrossedShin();
const HEAD = drawHead();

type PinnedNote = {
    number: string;
    repo: string;
    x: number;
    y: number;
    rotate: number;
    isMerged?: boolean;
};

const PINNED_NOTES: PinnedNote[] = [
    { number: "#142", repo: "acme/web", x: 1243, y: 314, rotate: 2 },
    { number: "#143", repo: "acme/api", x: 1410, y: 296, rotate: -6 },
    { number: "#147", repo: "billing", x: 1667, y: 302, rotate: -8 },
    { number: "#151", repo: "docs", x: 1331, y: 446, rotate: -4 },
    { number: "#149", repo: "acme/auth", x: 1515, y: 412, rotate: 5, isMerged: true },
    { number: "#152", repo: "mobile", x: 1747, y: 458, rotate: -3 },
];

const SIP_DELAY = 2400;
const SIP_CYCLE = 8000;
const SIP_KEYFRAMES: [time: number, lift: number][] = [
    [0, 0],
    [0.42, 0],
    [0.56, 1],
    [0.74, 1],
    [0.9, 0],
    [1, 0],
];

type Joint = { pivot: readonly [x: number, y: number]; angleAt: (time: number) => number };

const sipJoint = (pivot: Joint["pivot"], liftedAngle: number): Joint => ({
    pivot,
    angleAt: (time) => liftedAngle * sipLift(time),
});

const FOOT_BOB_PERIOD = 3400;

const NECK = sipJoint(NECK_PIVOT, 8);
const SHOULDER = sipJoint(SHOULDER_PIVOT, -20);
const ELBOW = sipJoint(ELBOW_PIVOT, -48);
const WRIST = sipJoint(WRIST_PIVOT, 53);
const KNEE: Joint = {
    pivot: KNEE_PIVOT,
    angleAt: (time) => 1.8 * Math.sin((time / FOOT_BOB_PERIOD) * Math.PI * 2),
};

function sipLift(time: number) {
    if (time < SIP_DELAY) return 0;
    const phase = ((time - SIP_DELAY) % SIP_CYCLE) / SIP_CYCLE;
    for (let index = 1; index < SIP_KEYFRAMES.length; index++) {
        const [endTime, endLift] = SIP_KEYFRAMES[index];
        const [startTime, startLift] = SIP_KEYFRAMES[index - 1];
        if (phase > endTime) continue;
        const t = (phase - startTime) / (endTime - startTime);
        const eased = t * t * (3 - 2 * t);
        return startLift + (endLift - startLift) * eased;
    }
    return 0;
}

function useJointLoop(joints: [RefObject<SVGGElement | null>, Joint][]) {
    const reduceMotion = useReducedMotion();
    useAnimationFrame((time) => {
        if (reduceMotion) return;
        for (const [ref, { pivot, angleAt }] of joints) {
            ref.current?.setAttribute(
                "transform",
                `rotate(${angleAt(time).toFixed(2)} ${pivot[0]} ${pivot[1]})`,
            );
        }
    });
}

const sketchReveal: Variants = {
    hidden: { maskPosition: "100% 0%" },
    shown: { maskPosition: "0% 0%", transition: { duration: 2.2, ease: [0.45, 0, 0.2, 1] } },
};

const noteInk: Variants = {
    hidden: { opacity: 0, y: -4 },
    shown: (index: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, delay: 1.6 + index * 0.12, ease: EASE_OUT },
    }),
};

const mergedStamp: Variants = {
    hidden: { opacity: 0, scale: 1.6 },
    shown: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.35, delay: 2.9, ease: [0.5, 0, 0.75, 0] },
    },
};

function Sketch({ drawings }: { drawings: Drawing[] }) {
    return drawings.map((drawing, index) => (
        <g key={index}>
            {drawing.fill && <path d={drawing.fill} className="fill-paper stroke-none" />}
            {drawing.texture &&
                GRAIN_TILES.map((tile, tileIndex) => (
                    <path
                        key={tile.size}
                        d={drawing.texture}
                        fill={`url(#control-grain-${tileIndex})`}
                        stroke="none"
                    />
                ))}
            {drawing.strokes.map((stroke, strokeIndex) =>
                stroke.d ? (
                    <path
                        key={strokeIndex}
                        d={stroke.d}
                        fill="none"
                        strokeWidth={TONE_STYLE[stroke.tone].width}
                        strokeOpacity={TONE_STYLE[stroke.tone].opacity}
                    />
                ) : null,
            )}
        </g>
    ));
}

function NoteInk({ note, index }: { note: PinnedNote; index: number }) {
    return (
        <g transform={`translate(${note.x} ${note.y}) rotate(${note.rotate})`}>
            <m.g variants={noteInk} custom={index}>
                <text
                    y={-4}
                    textAnchor="middle"
                    className="fill-violet-700 font-mono text-[24px] font-medium"
                >
                    {note.number}
                </text>
                {!note.isMerged && (
                    <text
                        y={22}
                        textAnchor="middle"
                        className="fill-stone-500 font-mono text-[14px]"
                    >
                        {note.repo}
                    </text>
                )}
            </m.g>
            {note.isMerged && (
                <m.g
                    variants={mergedStamp}
                    style={{ transformBox: "fill-box", transformOrigin: "center" }}
                >
                    <g transform="translate(0 24) rotate(-10)">
                        <rect
                            x={-38}
                            y={-13}
                            width={76}
                            height={26}
                            rx={4}
                            className="fill-none stroke-violet-600"
                            strokeWidth={2.5}
                        />
                        <text
                            y={6}
                            textAnchor="middle"
                            className="fill-violet-600 font-mono text-[14px] font-semibold tracking-[0.1em]"
                        >
                            MERGED
                        </text>
                    </g>
                </m.g>
            )}
        </g>
    );
}

function SippingDarwin() {
    const neck = useRef<SVGGElement>(null);
    const shoulder = useRef<SVGGElement>(null);
    const elbow = useRef<SVGGElement>(null);
    const wrist = useRef<SVGGElement>(null);
    const knee = useRef<SVGGElement>(null);
    useJointLoop([
        [neck, NECK],
        [shoulder, SHOULDER],
        [elbow, ELBOW],
        [wrist, WRIST],
        [knee, KNEE],
    ]);
    return (
        <>
            <g ref={knee}>
                <Sketch drawings={CROSSED_SHIN} />
            </g>
            <g ref={neck}>
                <Sketch drawings={HEAD} />
                <g transform={CUBE_FACE_MATRIX} className={DARWIN_LOGO_BRAND_COLOR}>
                    <svg x={0.16} y={0.14} width={0.68} height={0.72}>
                        <DarwinBlockLogo className="opacity-90" />
                    </svg>
                </g>
            </g>
            <g ref={shoulder}>
                <Sketch drawings={UPPER_ARM} />
                <g ref={elbow}>
                    <Sketch drawings={FOREARM} />
                    <g ref={wrist}>
                        <Sketch drawings={MUG_IN_HAND} />
                        {STEAM_WISPS.map((wisp, index) => (
                            <m.path
                                key={wisp}
                                d={wisp}
                                fill="none"
                                strokeWidth={1.1}
                                strokeLinecap="round"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: [0, 0.5, 0], y: [6, -10] }}
                                transition={{
                                    duration: 3.4,
                                    delay: index * 1.1,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                        ))}
                    </g>
                </g>
            </g>
        </>
    );
}

export default function ControlScene() {
    return (
        <MotionConfig reducedMotion="user">
            <m.div
                className="absolute inset-0 text-stone-800"
                initial="hidden"
                whileInView="shown"
                viewport={{ once: true, amount: 0.35 }}
            >
                <m.div
                    variants={sketchReveal}
                    className="absolute inset-0 [mask-image:linear-gradient(90deg,black_45%,transparent_55%)] [mask-size:220%_100%]"
                >
                    <svg viewBox={VIEW_BOX} className="absolute inset-0 size-full" aria-hidden>
                        <defs>
                            {GRAIN_TILES.map((tile, tileIndex) => (
                                <pattern
                                    key={tile.size}
                                    id={`control-grain-${tileIndex}`}
                                    width={tile.size}
                                    height={tile.size}
                                    patternUnits="userSpaceOnUse"
                                >
                                    <path
                                        d={tile.d}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={TONE_STYLE.grain.width}
                                        strokeOpacity={TONE_STYLE.grain.opacity}
                                        strokeLinecap="round"
                                    />
                                </pattern>
                            ))}
                        </defs>
                        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                            <Sketch drawings={STATIC_DRAWINGS} />
                        </g>
                    </svg>
                    <svg viewBox={VIEW_BOX} className="absolute inset-0 size-full" aria-hidden>
                        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                            <SippingDarwin />
                        </g>
                    </svg>
                </m.div>
                <svg viewBox={VIEW_BOX} className="absolute inset-0 size-full" aria-hidden>
                    {PINNED_NOTES.map((note, index) => (
                        <NoteInk key={note.number} note={note} index={index} />
                    ))}
                </svg>
            </m.div>
        </MotionConfig>
    );
}

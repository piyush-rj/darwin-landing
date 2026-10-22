"use client";

import { useInView, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import * as m from "motion/react-m";
import Image from "next/image";
import { useRef, useState } from "react";

import { DARWIN_LOGO_BRAND_COLOR, DarwinBlockLogo } from "@/components/logo/DarwinBlockLogo";
import { cn } from "@/lib/utils";
import { KanbanStatus } from "@/types/kanban";

import { TerminalGlyph } from "../PixelGlyphs";
import StatusBlock from "../StatusBlock";
import { ClaudeMark } from "./layer-scenes/sceneKit";
import { STORY_ISSUES, STORY_STAGES, type StoryIssue } from "./storyStages";
import SwapMosaic from "./SwapMosaic";

const STAGE = 560;
const CENTER = STAGE / 2;
const CARD_W = 248;
const CARD_H = 124;
const BOX = 52;
const EASE = [0.22, 1, 0.36, 1] as const;
const MOVE = { duration: 0.65, ease: EASE };
const CLAUDE_ORANGE = "#d97757";
const STORY_TILE_LEVELS = [0.04, 0.07, 0.11, 0.15, 0.2, 0.26];

const CARD_FACE = "border border-black/10 bg-snow";
const CARD_SHADOW = "shadow-[0_18px_44px_-24px_rgba(24,18,48,0.42)]";
const CHIP_SHADOW = "shadow-[0_8px_20px_-12px_rgba(24,18,48,0.35)]";

const CLUSTER = [
    { x: -56, y: -98, tilt: -7 },
    { x: 46, y: -8, tilt: 4.5 },
    { x: -42, y: 80, tilt: -4 },
];

const PILE_TILT = 54;
const PILE_GAP = 58;
const PILE_SHIFT = -PILE_GAP * 1.5;

const ORBIT_SCALE = 0.42;
const ORBIT_RADIUS = 190;
const ARM_RADIUS = ORBIT_RADIUS / ORBIT_SCALE;
const ARM_BASE = [-30, 90, 210];
const SPIN = { duration: 12, ease: "linear" as const, repeat: Infinity };
const STATION_SIZE = 56;

const BUCKET = { width: 240, height: 184, top: 286 };
const BUCKET_SHAPE = "polygon(8% 0%, 92% 0%, 83% 100%, 17% 100%)";
const REST = [
    { x: -60, y: 384, tilt: -9 },
    { x: 58, y: 388, tilt: 7 },
    { x: -2, y: 330, tilt: -4 },
];

const onCircle = (degrees: number) => {
    const radians = (degrees * Math.PI) / 180;
    return {
        x: CENTER + ORBIT_RADIUS * Math.cos(radians),
        y: CENTER + ORBIT_RADIUS * Math.sin(radians),
    };
};

const STATIONS = [
    {
        name: "Claude",
        degrees: -90,
        icon: <ClaudeMark className="size-6" style={{ color: CLAUDE_ORANGE }} />,
    },
    {
        name: "Terminal",
        degrees: 30,
        icon: <TerminalGlyph className="size-6 text-foreground" />,
    },
    {
        name: "Reviewer",
        degrees: 150,
        icon: (
            <Image
                src="/images/team/piyush.png"
                alt=""
                width={48}
                height={48}
                className="size-full scale-[1.3] object-cover object-[50%_40%]"
            />
        ),
    },
];

function CardFace({ issue }: { issue: StoryIssue }) {
    const Priority = issue.priority;
    return (
        <>
            <div className="flex items-center gap-2">
                <StatusBlock status={KanbanStatus.Todo} className="size-3.5" />
                <span className="text-[12px] tracking-wide text-neutral-400 tabular-nums">
                    {issue.id}
                </span>
                <Priority className="ml-auto size-4 text-neutral-400" />
            </div>
            <p className="mt-2.5 text-[15px] leading-snug font-medium tracking-[-0.01em] text-foreground">
                {issue.title}
            </p>
            <div className="mt-4 flex items-center justify-between">
                <span className="flex items-center gap-1.5 border border-edge px-2 py-[3px] text-[11px] text-neutral-500">
                    <span className={cn("size-1.5", issue.labelTone)} />
                    {issue.label}
                </span>
                <span className="text-[12px] font-medium text-red-500/90 tabular-nums">
                    {issue.waitedDays}d waiting
                </span>
            </div>
        </>
    );
}

function StoryCard({
    issue,
    index,
    stage,
    entered,
    reduceMotion,
}: {
    issue: StoryIssue;
    index: number;
    stage: number;
    entered: boolean;
    reduceMotion: boolean;
}) {
    const cluster = CLUSTER[index];
    const rest = REST[index];
    const armBase = ARM_BASE[index];
    const orbiting = stage === 2;
    const boxed = stage === 3;

    const position = [
        { x: CENTER + cluster.x - CARD_W / 2, y: CENTER + cluster.y - CARD_H / 2, scale: 1 },
        {
            x: CENTER - CARD_W / 2,
            y: CENTER - CARD_H / 2 + PILE_SHIFT + (index - 1) * PILE_GAP,
            scale: 0.98,
        },
        { x: CENTER - CARD_W / 2, y: CENTER - CARD_H / 2, scale: ORBIT_SCALE },
        { x: CENTER + rest.x - BOX / 2, y: rest.y, scale: 1 },
    ][stage];

    return (
        <m.div
            className="absolute top-0 left-0"
            style={{ zIndex: stage === 1 ? 12 - index : orbiting ? 12 : 10 + index }}
            initial={false}
            animate={{ opacity: entered ? 1 : 0, y: entered ? 0 : 64 }}
            transition={{ duration: 0.65, ease: EASE, delay: 0.1 + index * 0.13 }}
        >
            <m.div
                initial={false}
                animate={{
                    x: position.x,
                    y: boxed && !reduceMotion ? [null, rest.y - 26, rest.y] : position.y,
                    scale: position.scale,
                }}
                transition={
                    boxed
                        ? {
                              x: { duration: 0.55, ease: EASE },
                              scale: { duration: 0.55, ease: EASE },
                              y: reduceMotion
                                  ? MOVE
                                  : {
                                        duration: 1.05,
                                        times: [0, 0.72, 1],
                                        ease: ["easeIn", "easeOut"],
                                        delay: 0.25 + index * 0.22,
                                    },
                          }
                        : MOVE
                }
            >
                <m.div
                    initial={false}
                    animate={{ rotate: orbiting && !reduceMotion ? [armBase, armBase + 360] : 0 }}
                    transition={orbiting && !reduceMotion ? SPIN : { duration: 0.7, ease: EASE }}
                >
                    <m.div
                        initial={false}
                        animate={{ x: orbiting ? ARM_RADIUS : 0 }}
                        transition={{ duration: 0.7, ease: EASE }}
                    >
                        <m.div
                            className={cn("relative overflow-hidden", CARD_FACE, CARD_SHADOW)}
                            style={{ transformPerspective: 1000, width: CARD_W, height: CARD_H }}
                            initial={false}
                            animate={{
                                rotate: orbiting
                                    ? reduceMotion
                                        ? 0
                                        : [-armBase, -armBase - 360]
                                    : [cluster.tilt, 0, 0, rest.tilt][stage],
                                rotateX: stage === 1 ? PILE_TILT : 0,
                                width: boxed ? BOX : CARD_W,
                                height: boxed ? BOX : CARD_H,
                            }}
                            transition={{
                                rotate:
                                    orbiting && !reduceMotion
                                        ? SPIN
                                        : { duration: 0.7, ease: EASE },
                                rotateX: MOVE,
                                width: { duration: 0.45, ease: EASE },
                                height: { duration: 0.45, ease: EASE },
                            }}
                        >
                            <m.div
                                className="absolute top-0 left-0 w-[248px] p-4"
                                initial={false}
                                animate={{ opacity: boxed ? 0 : 1 }}
                                transition={{ duration: 0.25 }}
                            >
                                <CardFace issue={issue} />
                            </m.div>
                            <m.div
                                className="absolute inset-0 flex items-center justify-center"
                                initial={false}
                                animate={{ opacity: boxed ? 1 : 0 }}
                                transition={{ duration: 0.3, delay: boxed ? 0.15 : 0 }}
                            >
                                <StatusBlock status={KanbanStatus.Done} className="size-6" />
                            </m.div>
                        </m.div>
                    </m.div>
                </m.div>
            </m.div>
        </m.div>
    );
}

const PILE_EXTRAS = [
    { issue: 3, slot: 2, z: 9 },
    { issue: 4, slot: 3, z: 8 },
    { issue: 5, slot: 4, z: 7 },
];

function PileExtras({ shown }: { shown: boolean }) {
    return (
        <div aria-hidden className="pointer-events-none">
            {PILE_EXTRAS.map(({ issue, slot, z }) => (
                <m.div
                    key={STORY_ISSUES[issue].id}
                    className="absolute top-0 left-0"
                    style={{ left: CENTER - CARD_W / 2, zIndex: z }}
                    initial={false}
                    animate={{
                        opacity: shown ? 1 : 0,
                        y: CENTER - CARD_H / 2 + PILE_SHIFT + slot * PILE_GAP * (shown ? 1 : 0.15),
                        scale: 0.98,
                    }}
                    transition={
                        shown
                            ? {
                                  y: {
                                      duration: 0.6,
                                      ease: EASE,
                                      delay: 0.5 + (slot - 2) * 0.14,
                                  },
                                  opacity: {
                                      duration: 0.25,
                                      delay: 0.45 + (slot - 2) * 0.14,
                                  },
                              }
                            : { duration: 0.35, ease: EASE }
                    }
                >
                    <div
                        className={cn("relative p-4", CARD_FACE, CARD_SHADOW)}
                        style={{
                            width: CARD_W,
                            height: CARD_H,
                            transform: `perspective(1000px) rotateX(${PILE_TILT}deg)`,
                        }}
                    >
                        <CardFace issue={STORY_ISSUES[issue]} />
                    </div>
                </m.div>
            ))}
        </div>
    );
}

function OrbitDecor({ shown, layer }: { shown: boolean; layer: "ring" | "stations" }) {
    return (
        <m.div
            className={cn("pointer-events-none absolute inset-0", layer === "stations" && "z-20")}
            initial={false}
            animate={{ opacity: shown ? 1 : 0, scale: shown ? 1 : 0.94 }}
            transition={MOVE}
        >
            {layer === "ring" && (
                <svg
                    aria-hidden
                    viewBox={`0 0 ${STAGE} ${STAGE}`}
                    className="absolute inset-0 size-full text-foreground/20"
                >
                    <circle
                        cx={CENTER}
                        cy={CENTER}
                        r={ORBIT_RADIUS}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeDasharray="2 7"
                    />
                </svg>
            )}
            {layer === "stations" &&
                STATIONS.map((station) => {
                    const spot = onCircle(station.degrees);
                    return (
                        <div
                            key={station.name}
                            className="absolute z-20"
                            style={{
                                left: spot.x - STATION_SIZE / 2,
                                top: spot.y - STATION_SIZE / 2,
                            }}
                        >
                            <span
                                className={cn(
                                    "flex items-center justify-center overflow-hidden",
                                    CARD_FACE,
                                    CHIP_SHADOW,
                                )}
                                style={{ width: STATION_SIZE, height: STATION_SIZE }}
                            >
                                {station.icon}
                            </span>
                            <span className="absolute top-full left-1/2 mt-2.5 -translate-x-1/2 text-[13px] whitespace-nowrap text-neutral-500">
                                {station.name}
                            </span>
                        </div>
                    );
                })}
        </m.div>
    );
}

function BucketShell({ shown, layer }: { shown: boolean; layer: "back" | "front" }) {
    return (
        <m.div
            className={cn("pointer-events-none absolute", layer === "back" ? "z-[1]" : "z-30")}
            style={{ left: CENTER - BUCKET.width / 2, top: BUCKET.top }}
            initial={false}
            animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 28 }}
            transition={{ ...MOVE, duration: 0.5 }}
        >
            {layer === "back" ? (
                <div
                    className="bg-mist"
                    style={{ width: BUCKET.width, height: BUCKET.height, clipPath: BUCKET_SHAPE }}
                />
            ) : (
                <>
                    <div
                        className="relative"
                        style={{ width: BUCKET.width, height: BUCKET.height }}
                    >
                        <div
                            className="absolute inset-0 bg-white/40 backdrop-blur-[4px]"
                            style={{ clipPath: BUCKET_SHAPE }}
                        />
                        <svg
                            aria-hidden
                            viewBox={`0 0 ${BUCKET.width} ${BUCKET.height}`}
                            className="absolute inset-0 size-full"
                        >
                            <polygon
                                points={`${BUCKET.width * 0.08},1 ${BUCKET.width * 0.92},1 ${BUCKET.width * 0.83},${BUCKET.height - 1} ${BUCKET.width * 0.17},${BUCKET.height - 1}`}
                                fill="none"
                                stroke="rgba(24,18,48,0.3)"
                                strokeWidth="2"
                            />
                        </svg>
                        <DarwinBlockLogo
                            className={cn(
                                "absolute bottom-3.5 left-1/2 size-12 -translate-x-1/2",
                                DARWIN_LOGO_BRAND_COLOR,
                            )}
                        />
                    </div>
                    <p className="mt-3 text-center text-[13px] text-neutral-500">Darwin</p>
                </>
            )}
        </m.div>
    );
}

export default function StoryScroll() {
    const statementsRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const [stage, setStage] = useState(0);
    const reduceMotion = useReducedMotion() ?? false;
    const inView = useInView(stageRef, { once: true, amount: 0.3 });
    const entered = reduceMotion || inView;
    const { scrollYProgress } = useScroll({
        target: statementsRef,
        offset: ["start center", "end center"],
    });
    useMotionValueEvent(scrollYProgress, "change", (progress) =>
        setStage(
            Math.min(
                STORY_STAGES.length - 1,
                Math.max(0, Math.floor(progress * STORY_STAGES.length)),
            ),
        ),
    );

    return (
        <section id="story" className="w-full border-b border-edge bg-ink lg:grid lg:grid-cols-2">
            <div className="theme-light sticky top-11 z-10 flex h-[22rem] items-center justify-center overflow-hidden border-b border-edge bg-snow lg:order-1 lg:h-[calc(100svh-2.75rem)] lg:self-start lg:border-b-0 lg:border-r">
                <div className="absolute inset-0">
                    <SwapMosaic tone={STORY_STAGES[stage].tone} levels={STORY_TILE_LEVELS} />
                </div>
                <div className="relative scale-[0.54] sm:scale-[0.66] lg:scale-[0.78] xl:scale-100">
                    <div
                        ref={stageRef}
                        className="relative"
                        style={{ width: STAGE, height: STAGE }}
                    >
                        <BucketShell shown={stage === 3} layer="back" />
                        <PileExtras shown={stage === 1} />
                        <OrbitDecor shown={stage === 2} layer="ring" />
                        <OrbitDecor shown={stage === 2} layer="stations" />
                        {STORY_ISSUES.slice(0, 3).map((issue, index) => (
                            <StoryCard
                                key={issue.id}
                                issue={issue}
                                index={index}
                                stage={stage}
                                entered={entered}
                                reduceMotion={reduceMotion}
                            />
                        ))}
                        <BucketShell shown={stage === 3} layer="front" />
                    </div>
                </div>
            </div>

            <div ref={statementsRef} className="lg:order-2">
                {STORY_STAGES.map((item, index) => (
                    <div
                        key={item.statement}
                        className={cn(
                            "flex min-h-[60svh] items-center px-6 md:px-9 lg:min-h-[80svh] lg:justify-center",
                            index === STORY_STAGES.length - 1 && "lg:min-h-[130svh]",
                        )}
                    >
                        <p
                            className={cn(
                                "w-full max-w-[17ch] text-[30px] leading-[1.1] tracking-[-0.035em] transition-colors duration-500 sm:text-[38px] lg:text-[44px]",
                                index === stage ? "text-foreground" : "text-neutral-300",
                            )}
                        >
                            {item.statement}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}

"use client";

import {
    animate,
    type AnimationPlaybackControls,
    MotionConfig,
    useAnimate,
    useInView,
    useMotionValue,
    useReducedMotion,
    useTransform,
} from "motion/react";
import * as m from "motion/react-m";
import { type ReactNode, useEffect, useRef, useState } from "react";

import LifecycleFigure from "./LifecycleFigure";
import MergeGraphFigure from "./MergeGraphFigure";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const TILE_SHAPE = "size-[0.86em] rounded-[0.2em]";

function TileEntrance({
    tilt,
    delay,
    children,
}: {
    tilt: number;
    delay: number;
    children: ReactNode;
}) {
    return (
        <m.span
            initial={{ scale: 0.4, rotate: tilt * 3, opacity: 0 }}
            whileInView={{ scale: 1, rotate: tilt, opacity: 1 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay }}
            className={`relative mx-[0.2em] inline-flex -translate-y-[0.06em] align-middle ${TILE_SHAPE}`}
        >
            {children}
        </m.span>
    );
}

function LifecycleTile({ playing }: { playing: boolean }) {
    return (
        <TileEntrance tilt={-6} delay={0.1}>
            <span aria-hidden className={`relative block overflow-hidden bg-red-100 ${TILE_SHAPE}`}>
                <LifecycleFigure playing={playing} />
            </span>
        </TileEntrance>
    );
}

const COUNT_START = 41;
const COUNT_LIMIT = 99;

function CounterTile({ playing }: { playing: boolean }) {
    const reduceMotion = useReducedMotion();
    const [scope, animateScope] = useAnimate();
    const days = useMotionValue(COUNT_START);
    const label = useTransform(days, (value) =>
        value >= COUNT_LIMIT ? "99+" : `${Math.round(value)}d`,
    );
    const fill = useTransform(days, [COUNT_START, COUNT_LIMIT], [0, 1]);

    useEffect(() => {
        if (!playing || reduceMotion) return;
        let current: AnimationPlaybackControls | null = null;
        let cancelled = false;
        const run = async () => {
            current = animate(days, COUNT_LIMIT, { duration: 2.6, ease: [0.7, 0, 0.84, 0] });
            await current;
            if (cancelled) return;
            animateScope("[data-tile]", { scale: [1, 1.14, 1] }, { duration: 0.5, ease: EASE_OUT });
            animateScope(
                "[data-ring]",
                { scale: [1, 1.32], opacity: [0.8, 0] },
                { duration: 0.75, ease: EASE_OUT },
            );
            current = animate(days, COUNT_START, {
                delay: 0.9,
                duration: 1.1,
                ease: [0.65, 0, 0.35, 1],
            });
        };
        run();
        return () => {
            cancelled = true;
            current?.stop();
        };
    }, [playing, reduceMotion, days, animateScope]);

    return (
        <TileEntrance tilt={5} delay={0.25}>
            <span ref={scope} aria-hidden className={`relative ${TILE_SHAPE}`}>
                <span
                    data-ring
                    className={`absolute inset-0 border-[0.05em] border-red-500 opacity-0 ${TILE_SHAPE}`}
                />
                <span
                    data-tile
                    className={`relative flex items-center justify-center overflow-hidden bg-stone-950 ${TILE_SHAPE}`}
                >
                    <m.span
                        className="absolute inset-0 origin-bottom bg-red-500"
                        style={{ scaleY: fill }}
                    />
                    <m.span className="relative text-[0.32em] leading-none font-semibold tracking-[-0.04em] text-paper tabular-nums">
                        {label}
                    </m.span>
                </span>
            </span>
        </TileEntrance>
    );
}

function MergeTile({ playing }: { playing: boolean }) {
    return (
        <TileEntrance tilt={-4} delay={0.4}>
            <span
                aria-hidden
                className={`relative block overflow-hidden bg-violet-300 ${TILE_SHAPE}`}
            >
                <MergeGraphFigure playing={playing} />
            </span>
        </TileEntrance>
    );
}

const CUES_MS = [900, 1600, 2300];

export default function ProblemSection() {
    const headlineRef = useRef<HTMLHeadingElement>(null);
    const inView = useInView(headlineRef, { once: true, amount: 0.6 });
    const [cue, setCue] = useState(0);

    useEffect(() => {
        if (!inView) return;
        const timers = CUES_MS.map((delay, index) => setTimeout(() => setCue(index + 1), delay));
        return () => timers.forEach(clearTimeout);
    }, [inView]);

    return (
        <MotionConfig reducedMotion="user">
            <section
                id="problem"
                aria-labelledby="problem-title"
                className="w-full bg-paper px-4 pt-20 md:px-8 md:pt-30"
            >
                <div className="mx-auto w-full max-w-page text-center">
                    <p className="text-[13px] text-stone-500">The problem</p>

                    <h2
                        ref={headlineRef}
                        id="problem-title"
                        className="mx-auto pt-7 max-w-[14ch] text-[36px] leading-[1.08] font-semibold tracking-[-0.05em] text-stone-950 sm:text-[46px] md:max-w-none md:text-[54px] lg:text-[64px]"
                    >
                        Your backlog
                        <LifecycleTile playing={cue >= 1} />
                        grows
                        <br className="hidden md:block" /> faster than
                        <CounterTile playing={cue >= 2} />
                        you
                        <br className="hidden md:block" /> can
                        <MergeTile playing={cue >= 3} />
                        ship.
                    </h2>

                    <p className="mx-auto mt-9 max-w-[44ch] md:max-w-none text-[16px] leading-[1.5] text-stone-500 md:mt-10 md:text-[18px]">
                        Most of a backlog is small, well-understood work.
                        <br className="hidden md:block" /> It still waits for an engineer, a context
                        switch and a review.
                    </p>
                </div>
            </section>
        </MotionConfig>
    );
}

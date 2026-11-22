"use client";

import { animate, useMotionValue, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useRef } from "react";

const NODE_RADIUS = 7;
const STROKE = 5;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const MERGE_AT = 0.9;
const RETIRE_AT = 0.95;

const COMMIT_ROUTE = "M70 78 V32 Q70 22 60 22 H30";
const PULL_REQUEST_LINE = "M70 71 V32 Q70 22 60 22 H45";
const PULL_REQUEST_ARROW = "M51 15 L44 22 L51 29";

const WAITING_BRANCHES = [
    { path: "M30 40 C 46 40, 50 32, 63 32", node: { x: 70, y: 32 }, at: 1.05 },
    { path: "M30 52 H63", node: { x: 70, y: 52 }, at: 1.45 },
    { path: "M30 64 C 46 64, 50 72, 63 72", node: { x: 70, y: 72 }, at: 1.75 },
];

const line = {
    fill: "none",
    strokeWidth: STROKE,
    strokeLinecap: "round",
    strokeLinejoin: "round",
} as const;

function Node({ x, y }: { x: number; y: number }) {
    return (
        <circle
            cx={x}
            cy={y}
            r={NODE_RADIUS}
            className="fill-violet-300 stroke-violet-950"
            strokeWidth={STROKE}
        />
    );
}

export default function MergeGraphFigure({ playing }: { playing: boolean }) {
    const reduceMotion = useReducedMotion();
    const routeRef = useRef<SVGPathElement>(null);
    const commitX = useMotionValue(70);
    const commitY = useMotionValue(78);
    const at = (seconds: number) => (reduceMotion ? 0 : seconds);
    const ease = (duration: number) => ({ duration: reduceMotion ? 0 : duration, ease: EASE_OUT });

    useEffect(() => {
        const route = routeRef.current;
        if (!playing || !route) return;
        const length = route.getTotalLength();
        const travel = animate(0, 1, {
            duration: reduceMotion ? 0 : MERGE_AT,
            ease: [0.65, 0, 0.35, 1],
            onUpdate: (progress) => {
                const point = route.getPointAtLength(progress * length);
                commitX.set(point.x);
                commitY.set(point.y);
            },
        });
        return () => travel.stop();
    }, [playing, reduceMotion, commitX, commitY]);

    return (
        <svg viewBox="0 0 100 100" aria-hidden className="absolute inset-0 size-full">
            <path ref={routeRef} d={COMMIT_ROUTE} className="hidden" />

            <path d="M30 29 V71" className="stroke-violet-950" {...line} />

            <m.g
                initial={false}
                animate={{ opacity: playing ? 0 : 1 }}
                transition={{ ...ease(0.35), delay: at(RETIRE_AT) }}
            >
                <path d={PULL_REQUEST_LINE} className="stroke-violet-950" {...line} />
                <path d={PULL_REQUEST_ARROW} className="stroke-violet-950" {...line} />
                <Node x={70} y={78} />
            </m.g>

            {WAITING_BRANCHES.map((branch) => (
                <g key={branch.path}>
                    <m.path
                        d={branch.path}
                        className="stroke-violet-950"
                        {...line}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={
                            playing ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }
                        }
                        transition={{
                            pathLength: { ...ease(0.45), delay: at(branch.at) },
                            opacity: { duration: 0.01, delay: at(branch.at) },
                        }}
                    />
                    <m.g
                        style={{ originX: 0.5, originY: 0.5 }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={playing ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                        transition={{
                            scale: {
                                type: "spring",
                                stiffness: 420,
                                damping: 22,
                                delay: at(branch.at + 0.32),
                            },
                            opacity: { duration: 0.15, delay: at(branch.at + 0.32) },
                        }}
                    >
                        <Node x={branch.node.x} y={branch.node.y} />
                    </m.g>
                </g>
            ))}

            <Node x={30} y={78} />
            <Node x={30} y={22} />

            <m.circle
                cx={30}
                cy={22}
                r={NODE_RADIUS + STROKE / 2}
                className="fill-none stroke-violet-950"
                strokeWidth={2}
                initial={{ scale: 1, opacity: 0 }}
                animate={
                    playing ? { scale: [1, 1.9], opacity: [0.6, 0] } : { scale: 1, opacity: 0 }
                }
                transition={{
                    duration: reduceMotion ? 0 : 0.7,
                    ease: EASE_OUT,
                    delay: at(MERGE_AT),
                }}
                style={{ originX: 0.5, originY: 0.5 }}
            />
            <m.circle
                cx={30}
                cy={22}
                r={NODE_RADIUS + STROKE / 2}
                className="fill-violet-950"
                initial={{ opacity: 0 }}
                animate={{ opacity: playing ? 1 : 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.25, delay: at(MERGE_AT - 0.05) }}
            />

            <m.circle
                cx={commitX}
                cy={commitY}
                r={4.5}
                className="fill-violet-950"
                initial={{ opacity: 0 }}
                animate={{ opacity: playing ? [0, 1, 1, 0] : 0 }}
                transition={{
                    duration: reduceMotion ? 0 : MERGE_AT + 0.1,
                    times: [0, 0.12, 0.85, 1],
                }}
            />
        </svg>
    );
}

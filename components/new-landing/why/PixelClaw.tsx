"use client";

import type Matter from "matter-js";
import { useInView, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { KanbanStatus } from "@/types/kanban";

import StatusBlock from "../StatusBlock";

const STAGE_W = 560;
const CX = STAGE_W / 2;
const WALL_SPREAD = 240;
const TRAVEL_Y = 56;

const CELL = 7;
const ARM_W = CELL * 3;
const ARM_H = CELL * 6;
const BEAM_H = CELL * 3;
const DOME_W = CELL * 5;
const DOME_H = CELL * 2;
const CLAW_H = DOME_H + BEAM_H + ARM_H;
const SPAN_NARROW = DOME_W + ARM_W * 2;
const EXIT_Y = -(CLAW_H + 140);

const SPAWN_GAP_MS = 420;
const SETTLE_CALM_MS = 420;
const SETTLE_TIMEOUT_MS = 4200;
const AIM_MS = 500;
const DESCEND_MS = 550;
const GRIP_MS = 240;
const LIFT_MS = 820;

const OUTLINE = "#3f3f46";
const FILL = "#a1a1aa";
const LIGHT = "#d4d4d8";

const ISSUES = [
    { id: "NOC-142", label: "Rounding bug" },
    { id: "NOC-138", label: "UTC dates" },
    { id: "NOC-121", label: "Avatar 404" },
    { id: "NOC-137", label: "Flaky test" },
    { id: "NOC-129", label: "Slow query" },
    { id: "NOC-118", label: "Crash on save" },
    { id: "NOC-131", label: "Dead link" },
    { id: "NOC-124", label: "Sync race" },
];

const STATIC_PILE = [
    { x: -124, bottom: 30, deg: -5 },
    { x: 6, bottom: 32, deg: 3 },
    { x: 128, bottom: 28, deg: -2 },
    { x: -64, bottom: 66, deg: 7 },
    { x: 64, bottom: 64, deg: -6 },
    { x: -2, bottom: 100, deg: 2 },
    { x: -150, bottom: 64, deg: 14 },
    { x: 140, bottom: 62, deg: -11 },
];

function ClawArm({ side, span }: { side: "left" | "right"; span: number }) {
    return (
        <m.div
            className="absolute"
            style={{ top: DOME_H + BEAM_H - CELL, left: 0 }}
            initial={false}
            animate={{ x: side === "left" ? -span / 2 : span / 2 - ARM_W }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
            <div
                style={{
                    width: ARM_W,
                    height: ARM_H,
                    border: `${CELL}px solid ${OUTLINE}`,
                    background: FILL,
                }}
            />
            <div
                className="absolute"
                style={{
                    bottom: 0,
                    [side === "left" ? "left" : "right"]: ARM_W,
                    width: CELL,
                    height: CELL,
                    background: OUTLINE,
                }}
            />
        </m.div>
    );
}

function Claw({ span }: { span: number }) {
    return (
        <>
            <div
                className="absolute bottom-full left-1/2 h-[1800px] w-[8px] -translate-x-1/2"
                style={{
                    background: `linear-gradient(to right, ${LIGHT} 0 45%, #71717a 45% 100%)`,
                }}
            />
            <m.div
                className="absolute"
                style={{ top: DOME_H, height: BEAM_H }}
                initial={false}
                animate={{ width: span, x: -span / 2 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
                <div
                    className="size-full"
                    style={{ border: `${CELL}px solid ${OUTLINE}`, background: FILL }}
                />
            </m.div>
            <ClawArm side="left" span={span} />
            <ClawArm side="right" span={span} />
            <div
                className="absolute"
                style={{
                    top: 0,
                    left: -DOME_W / 2,
                    width: DOME_W,
                    height: DOME_H + CELL,
                    border: `${CELL}px solid ${OUTLINE}`,
                    background: LIGHT,
                }}
            />
        </>
    );
}

function easeInOut(t: number) {
    return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

function easeIn(t: number) {
    return t * t;
}

export default function PixelClaw({ className }: { className?: string }) {
    const stageRef = useRef<HTMLDivElement>(null);
    const clawRef = useRef<HTMLDivElement>(null);
    const pillNodes = useRef<(HTMLDivElement | null)[]>([]);
    const inView = useInView(stageRef, { amount: 0.3 });
    const reduceMotion = useReducedMotion();
    const [span, setSpan] = useState(SPAN_NARROW);

    useEffect(() => {
        if (!inView || reduceMotion) return;

        const stage = stageRef.current;
        const claw = clawRef.current;
        if (!stage || !claw) return;

        const H = stage.offsetHeight;
        const FLOOR_Y = H - 26;

        let disposed = false;
        let raf = 0;
        let engine: Matter.Engine | null = null;
        let M: typeof Matter | null = null;

        const nodes = pillNodes.current;
        const sizes = nodes.map((node) => ({
            w: node?.offsetWidth ?? 120,
            h: node?.offsetHeight ?? 36,
        }));

        type Phase = "rain" | "settle" | "aim" | "descend" | "grip" | "lift" | "home";
        let phase: Phase = "rain";
        let phaseStart = 0;
        let spawnedCount = 0;
        let calmSince: number | null = null;
        let lastSpawnAt = 0;
        const bodies: (Matter.Body | null)[] = ISSUES.map(() => null);
        let clawX = CX;
        let clawY = TRAVEL_Y;
        let fromX = CX;
        let fromY = TRAVEL_Y;
        let targetIndex = -1;
        let grabX = CX;
        let grabY = TRAVEL_Y;
        let heldOff = { dx: 0, dy: 0, angle: 0 };

        const setClaw = (x: number, y: number) => {
            clawX = x;
            clawY = y;
            claw.style.transform = `translate(${x}px, ${y}px)`;
        };

        const paintPill = (index: number, x: number, y: number, angle: number) => {
            const node = nodes[index];
            if (!node) return;
            const { w, h } = sizes[index];
            node.style.opacity = "1";
            node.style.transform = `translate(${x - w / 2}px, ${y - h / 2}px) rotate(${angle}rad)`;
        };

        const hidePill = (index: number) => {
            const node = nodes[index];
            if (!node) return;
            node.style.opacity = "0";
            node.style.transform = "translate(-9999px, -9999px)";
        };

        const spawnPill = (index: number) => {
            if (!engine || !M) return;
            const { w, h } = sizes[index];
            const band = index % 2 === 0 ? -1 : 1;
            const x = CX + band * (48 + Math.random() * 100);
            const body = M.Bodies.rectangle(x, -50, w, h, {
                chamfer: { radius: h / 2 - 1 },
                restitution: 0.32,
                friction: 0.42,
                frictionAir: 0.012,
                angle: (Math.random() - 0.5) * 0.7,
                angularVelocity: (Math.random() - 0.5) * 0.22,
            });
            M.Body.setVelocity(body, { x: (Math.random() - 0.5) * 2.4, y: 2 });
            M.Composite.add(engine.world, body);
            bodies[index] = body;
        };

        const liveBodies = () => bodies.filter((body): body is Matter.Body => body !== null);

        const topmostIndex = () => {
            let best = -1;
            let bestY = Infinity;
            bodies.forEach((body, index) => {
                if (body && body.position.y < bestY) {
                    bestY = body.position.y;
                    best = index;
                }
            });
            return best;
        };

        const beginAim = (now: number) => {
            targetIndex = topmostIndex();
            if (targetIndex === -1) {
                phase = "home";
                phaseStart = now;
                fromX = clawX;
                fromY = clawY;
                setSpan(SPAN_NARROW);
                return;
            }
            const body = bodies[targetIndex]!;
            grabX = body.position.x;
            grabY = body.position.y - (CLAW_H - sizes[targetIndex].h / 2 - 10);
            fromX = clawX;
            fromY = clawY;
            phase = "aim";
            phaseStart = now;
            setSpan(Math.min(sizes[targetIndex].w + 56, 300));
        };

        const start = async () => {
            const mod = await import("matter-js");
            if (disposed) return;
            M = (mod.default ?? mod) as typeof Matter;

            engine = M.Engine.create();
            engine.gravity.y = 1.3;
            M.Composite.add(engine.world, [
                M.Bodies.rectangle(CX, FLOOR_Y + 30, STAGE_W, 60, { isStatic: true }),
                M.Bodies.rectangle(CX - WALL_SPREAD - 30, H / 2, 60, H * 3, { isStatic: true }),
                M.Bodies.rectangle(CX + WALL_SPREAD + 30, H / 2, 60, H * 3, { isStatic: true }),
            ]);

            ISSUES.forEach((_, index) => hidePill(index));
            setClaw(CX, TRAVEL_Y);
            setSpan(SPAN_NARROW);
            phase = "rain";
            phaseStart = performance.now();
            spawnedCount = 0;
            calmSince = null;

            raf = requestAnimationFrame(tick);
        };

        const tick = (now: number) => {
            if (disposed || !engine || !M) return;
            const elapsed = now - phaseStart;

            M.Engine.update(engine, 1000 / 60);
            bodies.forEach((body, index) => {
                if (body) paintPill(index, body.position.x, body.position.y, body.angle);
            });

            if (phase === "rain") {
                if (spawnedCount < ISSUES.length && elapsed >= spawnedCount * SPAWN_GAP_MS) {
                    spawnPill(spawnedCount);
                    spawnedCount += 1;
                    lastSpawnAt = now;
                }
                if (spawnedCount === ISSUES.length) phase = "settle";
            } else if (phase === "settle") {
                const calm = liveBodies().every(
                    (body) =>
                        Math.hypot(body.velocity.x, body.velocity.y) < 0.25 &&
                        Math.abs(body.angularVelocity) < 0.07,
                );
                if (calm) {
                    calmSince ??= now;
                } else {
                    calmSince = null;
                }
                const timedOut = now - lastSpawnAt > SETTLE_TIMEOUT_MS;
                if ((calmSince !== null && now - calmSince > SETTLE_CALM_MS) || timedOut) {
                    beginAim(now);
                }
            } else if (phase === "aim") {
                const p = Math.min(elapsed / AIM_MS, 1);
                const e = easeInOut(p);
                setClaw(fromX + (grabX - fromX) * e, fromY + (TRAVEL_Y - fromY) * e);
                if (p === 1) {
                    const body = bodies[targetIndex];
                    if (body) {
                        grabX = body.position.x;
                        grabY = body.position.y - (CLAW_H - sizes[targetIndex].h / 2 - 10);
                    }
                    fromY = clawY;
                    phase = "descend";
                    phaseStart = now;
                }
            } else if (phase === "descend") {
                const p = Math.min(elapsed / DESCEND_MS, 1);
                setClaw(grabX, fromY + (grabY - fromY) * easeInOut(p));
                if (p === 1) {
                    const body = bodies[targetIndex];
                    if (body) {
                        heldOff = {
                            dx: body.position.x - clawX,
                            dy: body.position.y - clawY,
                            angle: body.angle,
                        };
                        M!.Composite.remove(engine!.world, body);
                        bodies[targetIndex] = null;
                    }
                    phase = "grip";
                    phaseStart = now;
                    setSpan(Math.min(sizes[targetIndex].w + 30, 280));
                }
            } else if (phase === "grip") {
                paintPill(targetIndex, clawX + heldOff.dx, clawY + heldOff.dy, heldOff.angle);
                if (elapsed >= GRIP_MS) {
                    phase = "lift";
                    phaseStart = now;
                }
            } else if (phase === "lift") {
                const p = Math.min(elapsed / LIFT_MS, 1);
                setClaw(grabX, grabY + (EXIT_Y - grabY) * easeIn(p));
                paintPill(
                    targetIndex,
                    clawX + heldOff.dx,
                    clawY + heldOff.dy,
                    heldOff.angle * (1 - p),
                );
                if (p === 1) {
                    hidePill(targetIndex);
                    calmSince = null;
                    phase = "settle";
                    phaseStart = now;
                    lastSpawnAt = now;
                }
            } else if (phase === "home") {
                const p = Math.min(elapsed / AIM_MS, 1);
                const e = easeInOut(p);
                setClaw(fromX + (CX - fromX) * e, fromY + (TRAVEL_Y - fromY) * e);
                if (p === 1) {
                    phase = "rain";
                    phaseStart = now;
                    spawnedCount = 0;
                    calmSince = null;
                }
            }

            raf = requestAnimationFrame(tick);
        };

        start();

        return () => {
            disposed = true;
            cancelAnimationFrame(raf);
            if (engine && M) {
                M.World.clear(engine.world, false);
                M.Engine.clear(engine);
            }
        };
    }, [inView, reduceMotion]);

    return (
        <div
            ref={stageRef}
            aria-hidden
            className={cn("relative h-full overflow-hidden", className)}
            style={{ width: STAGE_W }}
        >
            <div
                className="absolute inset-x-0 bottom-0 h-14"
                style={{
                    background: "linear-gradient(to top, rgba(24,18,48,0.07), rgba(24,18,48,0))",
                }}
            />

            {ISSUES.map((issue, index) => (
                <div
                    key={issue.id}
                    ref={(node) => {
                        pillNodes.current[index] = node;
                    }}
                    className="absolute top-0 left-0 z-10 flex h-9 w-max items-center gap-2 rounded-full border border-black/10 bg-snow pr-3.5 pl-3 shadow-[0_10px_24px_-12px_rgba(24,18,48,0.4)] will-change-transform"
                    style={
                        reduceMotion
                            ? {
                                  top: "auto",
                                  left: "50%",
                                  bottom: STATIC_PILE[index].bottom,
                                  transform: `translateX(calc(-50% + ${STATIC_PILE[index].x}px)) rotate(${STATIC_PILE[index].deg}deg)`,
                              }
                            : { transform: "translate(-9999px, -9999px)", opacity: 0 }
                    }
                >
                    <StatusBlock status={KanbanStatus.Todo} className="size-3 shrink-0" />
                    <span className="font-mono text-[10px] whitespace-nowrap text-neutral-400">
                        {issue.id}
                    </span>
                    <span className="text-[12px] font-medium whitespace-nowrap text-foreground">
                        {issue.label}
                    </span>
                </div>
            ))}

            <div
                ref={clawRef}
                className="absolute top-0 left-0 z-20"
                style={{
                    height: CLAW_H,
                    transform: `translate(${CX}px, ${TRAVEL_Y}px)`,
                }}
            >
                <Claw span={span} />
            </div>
        </div>
    );
}

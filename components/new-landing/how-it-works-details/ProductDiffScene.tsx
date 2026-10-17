"use client";

import { animate, useInView, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import * as m from "motion/react-m";
import { type PointerEvent, type ReactNode, useEffect, useRef, useState } from "react";

import { CheckIcon } from "@/components/icons";
import PixelSprite, { type PixelSpriteArt } from "@/components/new-landing/PixelSprite";
import { cn } from "@/lib/utils";

const PIXEL = 4;
const OUTLINE = "#d4d4d8";
const HANDLE = "#a1a1aa";
const SWEEP = [50, 85, 15, 50];
const SWEEP_SECONDS = 9;

const STEPPED_CORNERS = `polygon(${[
    `${PIXEL}px 0`,
    `calc(100% - ${PIXEL}px) 0`,
    `calc(100% - ${PIXEL}px) ${PIXEL}px`,
    `100% ${PIXEL}px`,
    `100% calc(100% - ${PIXEL}px)`,
    `calc(100% - ${PIXEL}px) calc(100% - ${PIXEL}px)`,
    `calc(100% - ${PIXEL}px) 100%`,
    `${PIXEL}px 100%`,
    `${PIXEL}px calc(100% - ${PIXEL}px)`,
    `0 calc(100% - ${PIXEL}px)`,
    `0 ${PIXEL}px`,
    `${PIXEL}px ${PIXEL}px`,
].join(", ")})`;

const KNOB: PixelSpriteArt = {
    rows: [
        ".ooooooooooo.",
        "ohhhhhhhhhhbo",
        "ohbbbbbbbbbso",
        "ohbbabbbabbso",
        "ohbaabbbaabso",
        "ohaaabbbaaaso",
        "ohbaabbbaabso",
        "ohbbabbbabbso",
        "ohbbbbbbbbbso",
        "obsssssssssso",
        ".ooooooooooo.",
    ],
    colors: { o: HANDLE, h: "#ffffff", b: "#f4f4f5", s: "#e4e4e7", a: "#52525b" },
};

const TRAFFIC_LIGHTS = ["#f87171", "#facc15", "#4ade80"];

function PixelBox({
    fill,
    className,
    children,
}: {
    fill: string;
    className?: string;
    children?: ReactNode;
}) {
    return (
        <div style={{ background: OUTLINE, clipPath: STEPPED_CORNERS, padding: PIXEL }}>
            <div className={className} style={{ background: fill, clipPath: STEPPED_CORNERS }}>
                {children}
            </div>
        </div>
    );
}

function CheckoutPage({ fixed }: { fixed: boolean }) {
    return (
        <div className="flex h-full items-center justify-center bg-[#fafafa]">
            <div className="w-[320px] rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_8px_24px_-12px_rgb(24_24_27/0.18)]">
                <p className="text-[15px] font-semibold text-zinc-900">Checkout</p>
                <p className="mt-0.5 text-[12.5px] text-zinc-500">Pro plan, billed monthly</p>
                <p className="mt-4 text-[12px] font-medium text-zinc-600">Card number</p>
                <div className="mt-1.5 flex h-9 items-center justify-between rounded-lg border border-zinc-200 px-3 font-mono text-[13px] text-zinc-800">
                    4242 4242 4242 4242
                    {fixed && <CheckIcon className="size-4 text-emerald-500" />}
                </div>
                <div
                    className={cn(
                        "mt-4 flex h-10 items-center justify-center rounded-lg text-[14px] font-medium",
                        fixed ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-400",
                    )}
                >
                    Pay $49.00
                </div>
            </div>
        </div>
    );
}

function PixelLabel({ children }: { children: ReactNode }) {
    return (
        <PixelBox
            fill="#ffffff"
            className="flex h-6 items-center px-2 font-pixel text-[12px] tracking-[0.08em] text-zinc-600 uppercase"
        >
            {children}
        </PixelBox>
    );
}

export default function ProductDiffScene() {
    const sceneRef = useRef<HTMLDivElement>(null);
    const pageRef = useRef<HTMLDivElement>(null);
    const inView = useInView(sceneRef, { amount: 0.3 });
    const reduceMotion = useReducedMotion();
    const [userTookOver, setUserTookOver] = useState(false);

    const position = useMotionValue(50);
    const beforeClip = useTransform(position, (value) => `inset(0 ${100 - value}% 0 0)`);
    const handleLeft = useTransform(position, (value) => `${value}%`);
    const beforeLabelOpacity = useTransform(position, [8, 16], [0, 1]);
    const afterLabelOpacity = useTransform(position, [84, 92], [1, 0]);

    useEffect(() => {
        if (!inView || reduceMotion || userTookOver) return;
        const controls = animate(position, SWEEP, {
            duration: SWEEP_SECONDS,
            ease: "easeInOut",
            repeat: Infinity,
        });
        return () => controls.stop();
    }, [inView, reduceMotion, userTookOver, position]);

    function moveHandleTo(clientX: number) {
        const bounds = pageRef.current?.getBoundingClientRect();
        if (!bounds) return;
        const percent = ((clientX - bounds.left) / bounds.width) * 100;
        position.set(Math.min(100, Math.max(0, percent)));
    }

    function startDrag(event: PointerEvent<HTMLDivElement>) {
        setUserTookOver(true);
        event.currentTarget.setPointerCapture(event.pointerId);
        moveHandleTo(event.clientX);
    }

    function drag(event: PointerEvent<HTMLDivElement>) {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) moveHandleTo(event.clientX);
    }

    return (
        <div
            ref={sceneRef}
            className="mx-auto w-full max-w-[720px] filter-[drop-shadow(6px_6px_0_rgb(24_24_27/0.08))]"
        >
            <PixelBox fill="#ffffff">
                <div className="flex h-10 items-center gap-2 bg-[#f4f4f5] px-3">
                    {TRAFFIC_LIGHTS.map((color) => (
                        <span key={color} className="size-3" style={{ background: color }} />
                    ))}
                    <div className="mx-auto w-full max-w-[300px]">
                        <PixelBox
                            fill="#ffffff"
                            className="flex h-6 items-center px-2 font-pixel text-[13px] text-zinc-600"
                        >
                            acme.dev/checkout
                        </PixelBox>
                    </div>
                    <span className="w-[52px]" />
                </div>
                <div style={{ height: PIXEL, background: OUTLINE }} />

                <div
                    ref={pageRef}
                    onPointerDown={startDrag}
                    onPointerMove={drag}
                    className="relative h-[300px] cursor-ew-resize touch-none overflow-hidden select-none"
                >
                    <div className="absolute inset-0">
                        <CheckoutPage fixed />
                    </div>
                    <m.div className="absolute inset-0" style={{ clipPath: beforeClip }}>
                        <CheckoutPage fixed={false} />
                    </m.div>

                    <m.div
                        className="pointer-events-none absolute top-3 left-3"
                        style={{ opacity: beforeLabelOpacity }}
                    >
                        <PixelLabel>Before</PixelLabel>
                    </m.div>
                    <m.div
                        className="pointer-events-none absolute top-3 right-3"
                        style={{ opacity: afterLabelOpacity }}
                    >
                        <PixelLabel>After</PixelLabel>
                    </m.div>

                    <m.div
                        aria-hidden
                        className="pointer-events-none absolute inset-y-0 w-0"
                        style={{ left: handleLeft }}
                    >
                        <span
                            className="absolute inset-y-0"
                            style={{ left: -PIXEL / 2, width: PIXEL, background: HANDLE }}
                        />
                        <PixelSprite
                            art={KNOB}
                            scale={PIXEL}
                            className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2"
                        />
                    </m.div>
                </div>
            </PixelBox>
        </div>
    );
}

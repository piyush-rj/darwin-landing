"use client";

import {
    easeInOut,
    type MotionValue,
    motionValue,
    useMotionValue,
    useReducedMotion,
    useScroll,
    useTransform,
} from "motion/react";
import * as m from "motion/react-m";
import Link from "next/link";
import { type RefObject, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

import { FooterLinkHoverArrowIcon } from "@/components/icons";
import RollingText from "@/components/utility/RollingText";

import BlockMosaic from "./BlockMosaic";
import PixelReveal from "./PixelReveal";
import PixelSprite, { type PixelSpriteArt } from "./PixelSprite";
import StatusStrip from "./StatusStrip";

const FEATURED: {
    title: string;
    description?: string;
    href: string;
    badge?: string;
    tone?: string;
}[] = [
    {
        title: "TypeScript projects only, for now.",
        description: "Darwin runs TypeScript codebases today. More languages are on the way.",
        href: "/blog?tab=changelog",
        badge: "TS",
        tone: "#3178C6",
    },
    { title: "Bug-proof fixes are live.", href: "/blog?tab=changelog" },
    { title: "Why we ship pull requests, not prompts.", href: "/why" },
    { title: "Every repo gets its own sandboxed runner.", href: "/blog?tab=changelog" },
];

const TS_BADGE: PixelSpriteArt = {
    rows: ["www.www", ".w..w..", ".w..www", ".w....w", ".w..www"],
    colors: { w: "#ffffff" },
};

const TS_TILE_SHADES = [
    "#3178C6",
    "color-mix(in oklab, #3178C6 76%, #ffffff)",
    "color-mix(in oklab, #3178C6 84%, #000000)",
    "color-mix(in oklab, #3178C6 52%, #ffffff)",
];

const TS_TILE_CELLS = Array.from({ length: 49 }, (_, cell) => {
    const hash = (cell * 37 + 11) % 97;
    return hash < 55 ? 0 : hash < 73 ? 1 : hash < 87 ? 2 : 3;
});

const DESKTOP_QUERY = "(min-width: 1024px)";
const STATEMENT_SCALE = 1.4;
const ICON_ROW_SPACE = 44;
const STATEMENT_LIFT = 30;
const STATEMENT_LINES = [
    "We turn the issues your team files",
    "into tested pull requests, fixed and",
    "proven in sandboxed runners.",
];

function subscribeToDesktop(onChange: () => void) {
    const query = window.matchMedia(DESKTOP_QUERY);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
}

function useIsDesktop() {
    return useSyncExternalStore(
        subscribeToDesktop,
        () => window.matchMedia(DESKTOP_QUERY).matches,
        () => false,
    );
}

function useCenteringLine(travel: MotionValue<number>, inset: MotionValue<number>) {
    return useTransform(() => travel.get() * inset.get());
}

function useHeroScroll(
    trackRef: RefObject<HTMLDivElement | null>,
    stageRef: RefObject<HTMLElement | null>,
    anchorRef: RefObject<HTMLDivElement | null>,
    blockRef: RefObject<HTMLDivElement | null>,
) {
    const shiftX = useMotionValue(0);
    const shiftY = useMotionValue(0);
    const [lineInsets] = useState(() => STATEMENT_LINES.map(() => motionValue(0)));
    const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

    useLayoutEffect(() => {
        const stage = stageRef.current;
        const anchor = anchorRef.current;
        const block = blockRef.current;
        if (!stage || !anchor || !block) return;
        const measure = () => {
            const stageBox = stage.getBoundingClientRect();
            const anchorBox = anchor.getBoundingClientRect();
            shiftX.set(stageBox.left + stageBox.width / 2 - (anchorBox.left + anchorBox.width / 2));
            const groupOffset = (ICON_ROW_SPACE * STATEMENT_SCALE) / 2;
            shiftY.set(
                stageBox.top +
                    stageBox.height / 2 -
                    (anchorBox.top + anchorBox.height / 2) +
                    groupOffset -
                    STATEMENT_LIFT,
            );
            Array.from(block.children).forEach((line, index) => {
                lineInsets[index]?.set((block.offsetWidth - (line as HTMLElement).offsetWidth) / 2);
            });
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(stage);
        observer.observe(block);
        document.fonts.ready.then(measure);
        return () => observer.disconnect();
    }, [anchorRef, blockRef, lineInsets, shiftX, shiftY, stageRef]);

    const exit = useTransform(scrollYProgress, [0, 0.45], [0, 1], { ease: easeInOut });
    const travel = useTransform(scrollYProgress, [0.05, 0.55], [0, 1], { ease: easeInOut });

    return {
        statement: {
            x: useTransform(() => travel.get() * shiftX.get()),
            y: useTransform(() => travel.get() * shiftY.get()),
            scale: useTransform(travel, [0, 1], [1, STATEMENT_SCALE]),
        },
        lines: [
            useCenteringLine(travel, lineInsets[0]),
            useCenteringLine(travel, lineInsets[1]),
            useCenteringLine(travel, lineInsets[2]),
        ],
        icons: {
            opacity: useTransform(travel, [0.65, 0.75], [0, 1]),
            y: useTransform(travel, [0.65, 0.8], [8, 0]),
        },
        statusReveal: [
            useTransform(travel, [0.72, 0.8], [0, 1]),
            useTransform(travel, [0.78, 0.86], [0, 1]),
            useTransform(travel, [0.84, 0.92], [0, 1]),
            useTransform(travel, [0.9, 0.98], [0, 1]),
        ],
        toLeft: { x: useTransform(exit, [0, 1], ["0vw", "-100vw"]) },
        toRight: { x: useTransform(exit, [0, 1], ["0vw", "100vw"]) },
        panel: { x: useTransform(exit, [0, 1], ["0%", "100%"]) },
    };
}

export default function LandingHeroSection() {
    const story = FEATURED[0];
    const trackRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLElement>(null);
    const anchorRef = useRef<HTMLDivElement>(null);
    const blockRef = useRef<HTMLDivElement>(null);
    const scroll = useHeroScroll(trackRef, stageRef, anchorRef, blockRef);
    const isDesktop = useIsDesktop();
    const reduceMotion = useReducedMotion();
    const animated = isDesktop && !reduceMotion;
    const motionStyle = <T,>(style: T) => (animated ? style : undefined);

    return (
        <div
            ref={trackRef}
            className={animated ? "h-[calc(250dvh-2.75rem)] overflow-x-clip" : undefined}
        >
            <section
                ref={stageRef}
                className="grid w-full border-b border-edge lg:sticky lg:top-11 lg:h-[calc(100dvh-2.75rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:grid-rows-[minmax(auto,1fr)_minmax(0,auto)]"
            >
                <m.div
                    style={motionStyle(scroll.toLeft)}
                    className="flex min-h-[18rem] items-end px-6 pt-16 pb-10 md:px-9 lg:min-h-[auto] lg:pt-10"
                >
                    <h1 className="text-[min(calc((100vw-3.25rem)/6.95),3.25rem)] leading-[0.95] font-normal tracking-[-0.035em] max-lg:leading-[1.08] max-sm:tracking-[-0.045em] text-foreground sm:text-[72px] lg:text-[88px]">
                        <RollingText text={"Issues in.\nPull requests out."} />
                    </h1>
                </m.div>

                <div className="relative z-10 flex items-end px-6 pt-10 pb-10 max-lg:border-t max-lg:border-edge md:px-9">
                    <m.div
                        aria-hidden
                        style={motionStyle(scroll.panel)}
                        className="absolute inset-0 border-edge bg-mist lg:border-b lg:border-l"
                    />
                    <PixelReveal
                        cover="var(--color-ink)"
                        tileSize={64}
                        startMs={200}
                        spreadMs={550}
                        className="z-20"
                    />
                    <div ref={anchorRef} className="relative">
                        <m.div style={motionStyle(scroll.statement)}>
                            {animated && (
                                <m.div
                                    aria-hidden
                                    style={scroll.icons}
                                    className="absolute inset-x-0 bottom-full mb-3 flex justify-center"
                                >
                                    <StatusStrip reveal={scroll.statusReveal} />
                                </m.div>
                            )}
                            <p className="max-w-[22ch] text-[24px] leading-[1.15] tracking-[-0.02em] text-foreground lg:hidden">
                                {STATEMENT_LINES.join(" ")}
                            </p>
                            <div
                                ref={blockRef}
                                className="hidden w-fit flex-col text-[23px] leading-[1.2] tracking-[-0.02em] text-foreground lg:flex"
                            >
                                {STATEMENT_LINES.map((line, index) => (
                                    <m.span
                                        key={line}
                                        style={motionStyle({ x: scroll.lines[index] })}
                                        className="w-fit whitespace-nowrap"
                                    >
                                        {line}
                                    </m.span>
                                ))}
                            </div>
                        </m.div>
                    </div>
                </div>

                <m.div style={motionStyle(scroll.toLeft)} className="overflow-hidden">
                    <BlockMosaic />
                </m.div>

                <m.div
                    style={motionStyle(scroll.toRight)}
                    className="relative flex flex-col justify-between gap-10 border-t border-edge px-6 py-6 max-lg:hidden md:px-9 lg:border-t-0"
                >
                    <PixelReveal
                        cover="var(--color-ink)"
                        tileSize={64}
                        startMs={350}
                        spreadMs={550}
                        className="z-20"
                    />
                    <div className="flex flex-col text-neutral-400">
                        {[0, 1, 2].map((arrow) => (
                            <FooterLinkHoverArrowIcon key={arrow} className="size-4" />
                        ))}
                    </div>

                    <div>
                        <p className="font-mono text-[11px] tracking-[0.12em] text-neutral-500 uppercase">
                            Featured
                        </p>
                        <div className="mt-3 flex items-stretch border border-edge bg-snow">
                            <Link
                                href={story.href}
                                className="flex min-w-0 flex-1 items-center gap-3 p-2 transition-colors hover:bg-mist"
                            >
                                <span
                                    aria-hidden
                                    className="relative grid size-14 shrink-0 place-items-center overflow-hidden"
                                    style={{ background: story.tone ?? "var(--color-primary)" }}
                                >
                                    {story.badge ? (
                                        <span className="absolute inset-0 grid grid-cols-7 grid-rows-7">
                                            {TS_TILE_CELLS.map((shade, cell) => (
                                                <span
                                                    key={cell}
                                                    style={{ background: TS_TILE_SHADES[shade] }}
                                                />
                                            ))}
                                        </span>
                                    ) : (
                                        <span className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                                            {[1, 3, 5, 7].map((cell) => (
                                                <span
                                                    key={cell}
                                                    style={{
                                                        gridColumn: (cell % 3) + 1,
                                                        gridRow: Math.floor(cell / 3) + 1,
                                                        background: `color-mix(in oklab, ${story.tone ?? "var(--color-primary)"} 72%, var(--color-black))`,
                                                    }}
                                                />
                                            ))}
                                        </span>
                                    )}
                                    {story.badge && (
                                        <PixelSprite
                                            art={TS_BADGE}
                                            scale={5}
                                            className="relative [filter:drop-shadow(3px_3px_0_rgba(13,37,71,0.55))]"
                                        />
                                    )}
                                </span>
                                <span className="flex min-w-0 flex-col gap-1">
                                    <span className="text-[15px] leading-snug text-foreground">
                                        {story.title}
                                    </span>
                                    {story.description && (
                                        <span className="text-[12.5px] leading-snug text-neutral-500">
                                            {story.description}
                                        </span>
                                    )}
                                </span>
                            </Link>
                        </div>
                    </div>
                </m.div>
            </section>
        </div>
    );
}

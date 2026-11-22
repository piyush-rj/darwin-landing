"use client";

import { useLenis } from "lenis/react";
import {
    type MotionValue,
    useAnimate,
    useMotionValueEvent,
    useReducedMotion,
    useScroll,
    useTransform,
} from "motion/react";
import * as m from "motion/react-m";
import { type RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";

import { MOCK_HEIGHT, MOCK_SCENES, MOCK_WIDTH } from "./inside-darwin/playgroundBoard";
import PlaygroundMock from "./inside-darwin/PlaygroundMock";
import StatusRelayGlyph, { type RelayStatus } from "./inside-darwin/StatusRelayGlyph";
import SectionHeader from "./SectionHeader";

const FEATURES = [
    {
        title: "A board your team already knows",
        status: "queued" as RelayStatus,
        tone: "text-sky-500",
        body: "Issues move through To Do, Queued, In Progress, In Review and Done. The agent works the same board you do.",
    },
    {
        title: "The agent picks up the work",
        status: "progress" as RelayStatus,
        tone: "text-amber-500",
        body: "Well-scoped issues are claimed and run in a sandboxed runner. Every file read, edit and command lands in the agent logs.",
    },
    {
        title: "It asks before it guesses",
        status: "waiting" as RelayStatus,
        tone: "text-rose-500",
        body: "When something is unclear, Darwin stops and asks your team, with options to pick or room to answer in your own words.",
    },
    {
        title: "It ends in a pull request",
        status: "review" as RelayStatus,
        tone: "text-violet-500",
        body: "The fix comes back with its checks attached. Review it, merge it, and the issue moves to Done.",
    },
];

const SCROLL_PER_POINT_VH = 65;

const INK_SWEEP_SHARE = 0.7;
const GLYPH_SIZE = 17;

function useInkFill(progress: MotionValue<number>, index: number) {
    const reduceMotion = useReducedMotion();
    return useTransform(progress, (value) => {
        const reached = value * FEATURES.length - index;
        if (reduceMotion) return reached >= 0 ? 1 : 0;
        return Math.min(1, Math.max(0, reached / INK_SWEEP_SHARE));
    });
}

function FeatureRow({
    feature,
    index,
    active,
    progress,
    titleRef,
    onSelect,
}: {
    feature: (typeof FEATURES)[number];
    index: number;
    active: boolean;
    progress: MotionValue<number>;
    titleRef: (node: HTMLSpanElement | null) => void;
    onSelect: () => void;
}) {
    const fill = useInkFill(progress, index);
    const inkClip = useTransform(fill, (value) => `inset(0 ${(1 - value) * 100}% 0 0)`);

    return (
        <li>
            <button
                type="button"
                onClick={onSelect}
                aria-pressed={active}
                className="block w-full py-3 pl-8 text-left outline-none focus-visible:ring-1 focus-visible:ring-stone-300 lg:py-4"
            >
                <span
                    ref={titleRef}
                    className="relative block text-[17px] leading-[1.3] font-medium tracking-[-0.015em] text-stone-400 lg:text-[19px]"
                >
                    {feature.title}
                    <m.span
                        aria-hidden
                        className="absolute inset-0 text-stone-950"
                        style={{ clipPath: inkClip }}
                    >
                        {feature.title}
                    </m.span>
                </span>
                <span
                    className={`mt-2 max-w-[44ch] text-[15px] leading-[1.6] transition-colors duration-300 lg:block lg:text-[16px] ${active ? "block text-stone-500" : "hidden text-stone-300"}`}
                >
                    {feature.body}
                </span>
            </button>
        </li>
    );
}

function useGlyphOffset(
    listRef: RefObject<HTMLUListElement | null>,
    titleRefs: RefObject<(HTMLSpanElement | null)[]>,
    active: number,
) {
    const [offset, setOffset] = useState(0);

    useLayoutEffect(() => {
        const measure = () => {
            const list = listRef.current;
            const title = titleRefs.current[active];
            if (!list || !title) return;
            const firstLine = parseFloat(getComputedStyle(title).lineHeight);
            const top = title.getBoundingClientRect().top - list.getBoundingClientRect().top;
            setOffset(top + firstLine / 2 - GLYPH_SIZE / 2);
        };
        measure();
        const observer = new ResizeObserver(measure);
        listRef.current?.querySelectorAll("li").forEach((row) => observer.observe(row));
        return () => observer.disconnect();
    }, [listRef, titleRefs, active]);

    return offset;
}

function RelayMarker({ active, offset }: { active: number; offset: number }) {
    const [scope, animateScope] = useAnimate();
    const reduceMotion = useReducedMotion();
    const landedOnce = useRef(false);

    useEffect(() => {
        if (!landedOnce.current) {
            landedOnce.current = true;
            return;
        }
        if (reduceMotion) return;
        animateScope(
            scope.current,
            { scaleY: [1, 1.3, 0.82, 1], scaleX: [1, 0.84, 1.12, 1] },
            { duration: 0.45, times: [0, 0.45, 0.75, 1], ease: "easeOut" },
        );
    }, [active, animateScope, scope, reduceMotion]);

    const feature = FEATURES[active];

    return (
        <span
            aria-hidden
            className="pointer-events-none absolute top-0 left-0 transition-transform duration-[450ms] ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none"
            style={{
                width: GLYPH_SIZE,
                height: GLYPH_SIZE,
                transform: `translateY(${offset}px)`,
            }}
        >
            <span
                ref={scope}
                className={`block size-full transition-colors duration-500 ${feature.tone}`}
            >
                <StatusRelayGlyph status={feature.status} />
            </span>
        </span>
    );
}

const DESKTOP_MIN_WIDTH = 768;
const STAGE_MARGIN = 112;

function stageScale() {
    const { innerWidth: width, innerHeight: height } = window;
    if (width >= DESKTOP_MIN_WIDTH) {
        return Math.min(0.9, (height - STAGE_MARGIN) / MOCK_HEIGHT);
    }
    return Math.min(((width - 32) / MOCK_WIDTH) * 1.15, (height * 0.38) / MOCK_HEIGHT);
}

function useStageScale() {
    const [scale, setScale] = useState(0.6);

    useLayoutEffect(() => {
        const update = () => setScale(stageScale());
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    return scale;
}

export default function InsideDarwinSection() {
    const trackRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const titleRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const [active, setActive] = useState(0);
    const scale = useStageScale();
    const lenis = useLenis();
    const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

    useMotionValueEvent(scrollYProgress, "change", (progress) => {
        setActive(Math.min(FEATURES.length - 1, Math.floor(progress * FEATURES.length)));
    });

    const glyphOffset = useGlyphOffset(listRef, titleRefs, active);

    const scrollToPoint = (index: number) => {
        const track = trackRef.current;
        if (!track) return;
        const travel = track.offsetHeight - window.innerHeight;
        const top = track.getBoundingClientRect().top + window.scrollY;
        const target = top + (travel * (index + 0.5)) / FEATURES.length;
        if (lenis) lenis.scrollTo(target);
        else window.scrollTo({ top: target, behavior: "smooth" });
    };

    return (
        <section
            id="inside-darwin"
            aria-labelledby="inside-darwin-title"
            className="w-full bg-paper"
        >
            <div className="px-4 pt-24 md:px-8 md:pt-36">
                <div className="mx-auto max-w-page">
                    <SectionHeader
                        label="Inside Darwin"
                        titleId="inside-darwin-title"
                        title="One board. Your team and an agent on it."
                        description="This is the Darwin playground. Issues sit on a Kanban board, and the agent works the same lanes your team does, out in the open."
                    />
                </div>
            </div>

            <div
                ref={trackRef}
                className="relative"
                style={{ height: `calc(100vh + ${FEATURES.length * SCROLL_PER_POINT_VH}vh)` }}
            >
                <div className="sticky top-0 flex h-screen items-center px-4 md:px-8">
                    <div className="mx-auto grid w-full max-w-page grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] md:items-stretch md:gap-x-12 lg:gap-x-20">
                        <div className="md:col-start-2 md:row-start-1">
                            <div style={{ height: MOCK_HEIGHT * scale }}>
                                <div
                                    className="origin-top-left"
                                    style={{ width: MOCK_WIDTH, transform: `scale(${scale})` }}
                                >
                                    <PlaygroundMock scene={MOCK_SCENES[active]} />
                                </div>
                            </div>
                        </div>

                        <ul
                            ref={listRef}
                            className="relative md:col-start-1 md:row-start-1 md:flex md:flex-col md:justify-between md:py-8"
                        >
                            <RelayMarker active={active} offset={glyphOffset} />
                            {FEATURES.map((feature, index) => (
                                <FeatureRow
                                    key={feature.title}
                                    feature={feature}
                                    index={index}
                                    active={index === active}
                                    progress={scrollYProgress}
                                    titleRef={(node) => {
                                        titleRefs.current[index] = node;
                                    }}
                                    onSelect={() => scrollToPoint(index)}
                                />
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}

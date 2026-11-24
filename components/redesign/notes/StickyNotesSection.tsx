"use client";

import { type MotionValue, useReducedMotion, useScroll, useTransform } from "motion/react";
import * as m from "motion/react-m";
import { type CSSProperties, useRef } from "react";

import { DarwinBlockLogo } from "@/components/logo/DarwinBlockLogo";

type Note = {
    stat: string;
    text: string;
    aside?: string;
    tone: string;
    x: number;
    y: number;
    mobile: [x: number, y: number];
    rotate: number;
};

const NOTES: Note[] = [
    {
        stat: "3:12 am",
        text: "when the median bug report lands.",
        aside: "(nobody is awake to read it)",
        tone: "bg-orange-500 text-stone-950",
        x: 20,
        y: 12,
        mobile: [2, 6],
        rotate: -6,
    },
    {
        stat: "41 days",
        text: "the oldest open issue on a twelve-person team.",
        tone: "bg-blue-500 text-stone-950",
        x: 60,
        y: 12,
        mobile: [52, 10],
        rotate: 5,
    },
    {
        stat: "2,387",
        text: "small fixes nobody got to this quarter.",
        aside: "(each one five minutes, apparently)",
        tone: "bg-amber-400 text-stone-950",
        x: 40,
        y: 60,
        mobile: [27, 34],
        rotate: -3,
    },
    {
        stat: "11 hours",
        text: "from filed to first human reply.",
        tone: "bg-emerald-500 text-stone-950",
        x: 8,
        y: 46,
        mobile: [0, 58],
        rotate: 7,
    },
    {
        stat: "0",
        text: "pushes to main by Darwin. Ever.",
        aside: "(pull requests only, with the tests attached)",
        tone: "bg-stone-950 text-paper",
        x: 72,
        y: 46,
        mobile: [54, 62],
        rotate: -5,
    },
];

const SCROLL_PER_NOTE_VH = 42;
const HEADLINE_SHARE = 0.08;
const EASE_OUT_BACK = (t: number) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);

function useNoteProgress(progress: MotionValue<number>, index: number, frozen: boolean) {
    const span = (1 - HEADLINE_SHARE) / NOTES.length;
    const start = HEADLINE_SHARE + index * span;
    return useTransform(progress, (value) =>
        frozen ? 1 : Math.min(1, Math.max(0, (value - start) / (span * 0.8))),
    );
}

function StickyNote({
    note,
    index,
    progress,
    frozen,
}: {
    note: Note;
    index: number;
    progress: MotionValue<number>;
    frozen: boolean;
}) {
    const local = useNoteProgress(progress, index, frozen);
    const opacity = useTransform(local, [0, 0.25], [0, 1]);
    const scale = useTransform(local, (t) => 1.18 - 0.18 * EASE_OUT_BACK(t));
    const rotate = useTransform(local, (t) => note.rotate * (2.2 - 1.2 * EASE_OUT_BACK(t)));
    const y = useTransform(local, (t) => -36 * (1 - EASE_OUT_BACK(t)));
    return (
        <m.div
            className={`absolute left-(--note-x-mobile) top-(--note-y-mobile) w-[46%] p-[clamp(14px,1.6vw,22px)] shadow-[0_18px_40px_-18px] shadow-stone-900/40 md:left-(--note-x) md:top-(--note-y) md:w-[clamp(150px,19vw,236px)] ${note.tone}`}
            style={{
                ...({
                    "--note-x": `${note.x}%`,
                    "--note-y": `${note.y}%`,
                    "--note-x-mobile": `${note.mobile[0]}%`,
                    "--note-y-mobile": `${note.mobile[1]}%`,
                } as CSSProperties),
                zIndex: 10 + index,
                opacity,
                scale,
                rotate,
                y,
            }}
        >
            <p className="text-[clamp(14px,1.45vw,21px)] leading-[1.22] font-medium tracking-[-0.02em]">
                <span
                    className={`px-1 ${note.tone.includes("text-paper") ? "bg-paper text-stone-950" : "bg-stone-950 text-paper"}`}
                >
                    {note.stat}
                </span>{" "}
                {note.text}
            </p>
            {note.aside && (
                <p className="mt-[clamp(10px,1.4vw,22px)] text-[clamp(10px,0.9vw,12px)] leading-snug opacity-80">
                    {note.aside}
                </p>
            )}
        </m.div>
    );
}

export default function StickyNotesSection() {
    const trackRef = useRef<HTMLDivElement>(null);
    const frozen = useReducedMotion() ?? false;
    const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

    return (
        <section
            ref={trackRef}
            aria-labelledby="notes-title"
            className="relative w-full bg-paper"
            style={{ height: `calc(100vh + ${NOTES.length * SCROLL_PER_NOTE_VH}vh)` }}
        >
            <div className="sticky top-0 flex h-screen items-center overflow-hidden px-4 md:px-8">
                <div className="relative mx-auto aspect-[3/4] w-full max-w-[1180px] md:aspect-[16/9]">
                    <div className="relative flex h-full flex-col items-center justify-center text-center">
                        <p className="text-[13px] text-stone-500">The backlog, after hours</p>
                        <h2
                            id="notes-title"
                            className="mt-6 text-[clamp(40px,5.6vw,80px)] leading-[1] font-normal tracking-[-0.05em] text-stone-950"
                        >
                            <span className="block">
                                the issues{" "}
                                <DarwinBlockLogo className="inline-block size-[0.72em] -translate-y-[0.04em] align-middle" />{" "}
                                nobody
                            </span>
                            <span className="block">picks up</span>
                        </h2>
                        <p className="mt-7 max-w-[36ch] text-[clamp(15px,1.3vw,19px)] leading-[1.4] tracking-[-0.01em] text-stone-600">
                            Filed at night, stale by Friday. These are the ones that happen when no
                            one is watching.
                        </p>
                    </div>

                    {NOTES.map((note, index) => (
                        <StickyNote
                            key={note.stat}
                            note={note}
                            index={index}
                            progress={scrollYProgress}
                            frozen={frozen}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

"use client";

import { AnimatePresence, useInView, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { Newsreader } from "next/font/google";
import { useRef, useState } from "react";

import ProblemGlobe, { type GlobeFocus } from "./ProblemGlobe";

const newsreader = Newsreader({
    variable: "--font-newsreader",
    subsets: ["latin"],
});

type StalledIssue = GlobeFocus & { region: string; daysOpen: number; title: string };

const STALLED_ISSUES: StalledIssue[] = [
    {
        region: "United States",
        country: "United States of America",
        center: [-98, 38],
        daysOpen: 41,
        title: "Issue search misses anything with a hyphen in the title.",
    },
    {
        region: "Brazil",
        country: "Brazil",
        center: [-52, -12],
        daysOpen: 23,
        title: "Export to CSV drops the last row whenever the list is filtered.",
    },
    {
        region: "United Kingdom",
        country: "United Kingdom",
        center: [-2.5, 53],
        daysOpen: 58,
        title: "Password reset links expire before the email arrives.",
    },
    {
        region: "Germany",
        country: "Germany",
        center: [10.4, 50],
        daysOpen: 17,
        title: "Kanban card avatars flash the wrong colour on first paint.",
    },
    {
        region: "Nigeria",
        country: "Nigeria",
        center: [8, 9],
        daysOpen: 34,
        title: "The retry button on failed uploads does nothing on mobile Safari.",
    },
    {
        region: "India",
        country: "India",
        center: [79, 21],
        daysOpen: 72,
        title: "OTP lockout counter never resets after a successful sign-in.",
    },
    {
        region: "Japan",
        country: "Japan",
        center: [138, 36],
        daysOpen: 29,
        title: "The date picker starts weeks on Sunday even when the locale says Monday.",
    },
    {
        region: "Australia",
        country: "Australia",
        center: [134, -25],
        daysOpen: 46,
        title: "Invoice totals round the wrong way on half-cent taxes.",
    },
];

const DWELL_MS = 5200;

export default function ProblemGlobeSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const inView = useInView(sectionRef, { amount: 0.4 });
    const reduceMotion = useReducedMotion() ?? false;
    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);
    const issue = STALLED_ISSUES[current];
    const advance = () => setCurrent((index) => (index + 1) % STALLED_ISSUES.length);

    return (
        <section
            ref={sectionRef}
            id="problem"
            aria-labelledby="problem-title"
            className={`${newsreader.variable} relative h-svh min-h-[680px] w-full overflow-hidden bg-plate`}
        >
            <ProblemGlobe focus={issue} reduceMotion={reduceMotion} />

            <div className="pointer-events-none relative flex flex-col items-center px-4 pt-[max(96px,11svh)] text-center">
                <h2
                    id="problem-title"
                    className="font-(family-name:--font-newsreader) text-[clamp(40px,6.4svh,76px)] leading-[1.04] font-normal tracking-[-0.025em] text-balance text-stone-950"
                >
                    Your backlog grows
                    <br className="max-sm:hidden" /> faster than you ship
                </h2>
                <p className="pointer-events-auto mt-5 max-w-[350px] text-left text-[14px] leading-[1.4] text-stone-700">
                    Most of a backlog is small, well-understood work: a broken filter, a flaky
                    sign-in, an export that drops a row. Each one waits weeks for an engineer, a
                    context switch and a review, until{" "}
                    <a
                        href="#how-it-works"
                        className="underline decoration-stone-400 underline-offset-2 transition-colors hover:decoration-stone-950"
                    >
                        Darwin picks it up
                    </a>
                    .
                </p>
            </div>

            <div
                className="absolute inset-x-4 bottom-24 md:inset-x-auto md:top-[69%] md:bottom-auto md:left-[calc(50%-45svh)] md:w-[480px]"
                onPointerEnter={() => setPaused(true)}
                onPointerLeave={() => setPaused(false)}
                onFocus={() => setPaused(true)}
                onBlur={() => setPaused(false)}
            >
                <div
                    className="flex items-center gap-[7px]"
                    role="tablist"
                    aria-label="Stalled issues"
                >
                    {STALLED_ISSUES.map((stalled, index) => (
                        <button
                            key={stalled.region}
                            type="button"
                            role="tab"
                            aria-selected={index === current}
                            aria-label={stalled.region}
                            onClick={() => setCurrent(index)}
                            className={`relative h-[7px] cursor-pointer overflow-hidden rounded-full bg-stone-300 transition-[width,background-color] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] outline-none focus-visible:ring-2 focus-visible:ring-stone-950 ${index === current ? "w-7" : "w-[7px] hover:bg-stone-500"}`}
                        >
                            {index === current && (
                                <span
                                    className="absolute inset-0 origin-left animate-pager-fill rounded-full bg-stone-800"
                                    style={{
                                        animationDuration: `${DWELL_MS}ms`,
                                        animationPlayState:
                                            inView && !paused ? "running" : "paused",
                                    }}
                                    onAnimationEnd={advance}
                                />
                            )}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait" initial={false}>
                    <m.figure
                        key={issue.region}
                        role="tabpanel"
                        aria-live="polite"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                        className="mt-3"
                    >
                        <figcaption className="inline-block bg-amber-200 px-1 py-px text-[11px] leading-[1.35] font-medium tracking-[0.04em] text-stone-950 uppercase">
                            {issue.region} · Open {issue.daysOpen} days
                        </figcaption>
                        <blockquote className="mt-1.5 pl-[0.45em] -indent-[0.45em] font-(family-name:--font-newsreader) text-[26px] leading-[1.15] tracking-[-0.01em] text-stone-950 md:text-[30px]">
                            “{issue.title}”
                        </blockquote>
                    </m.figure>
                </AnimatePresence>
            </div>

            <a
                href="#how-it-works"
                className="absolute bottom-7 left-1/2 flex h-8 -translate-x-1/2 items-center rounded-[4px] bg-snow/70 px-3 text-[12px] text-stone-800 shadow-[0_1px_2px] shadow-stone-900/5 ring-1 ring-stone-900/5 backdrop-blur-sm transition-colors hover:bg-snow"
            >
                See how it works
            </a>

            <p className="absolute right-7 bottom-8 text-[11px] text-stone-500 max-md:hidden">
                Illustrative · each dot is one open issue
            </p>
        </section>
    );
}

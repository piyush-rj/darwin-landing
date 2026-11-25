"use client";

import { AnimatePresence, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useState } from "react";

import FadeIn from "@/components/new-landing/FadeIn";

import { PlainTicketLink } from "../hero/TicketButtons";
import IssueGlobe, { type GlobeFocus } from "./IssueGlobe";

type OpenIssue = GlobeFocus & { country: string; openDays: number; quote: string };

const OPEN_ISSUES: OpenIssue[] = [
    {
        country: "United Kingdom",
        countryId: 31,
        lng: -2,
        lat: 54,
        openDays: 58,
        quote: "Password reset links expire before the email arrives.",
    },
    {
        country: "United States",
        countryId: 16,
        lng: -96,
        lat: 38,
        openDays: 23,
        quote: "Export to CSV drops the last row.",
    },
    {
        country: "Germany",
        countryId: 156,
        lng: 10,
        lat: 51,
        openDays: 41,
        quote: "Date filter ignores the user's timezone.",
    },
    {
        country: "India",
        countryId: 144,
        lng: 78,
        lat: 21,
        openDays: 17,
        quote: "Search results flicker on the second keystroke.",
    },
    {
        country: "Brazil",
        countryId: 210,
        lng: -50,
        lat: -14,
        openDays: 66,
        quote: "Invoice PDF cuts off long addresses.",
    },
    {
        country: "Japan",
        countryId: 135,
        lng: 138,
        lat: 36,
        openDays: 12,
        quote: "Dark mode forgets itself after sign-out.",
    },
    {
        country: "Australia",
        countryId: 225,
        lng: 134,
        lat: -26,
        openDays: 34,
        quote: "Webhook retries fire twice on timeout.",
    },
    {
        country: "Canada",
        countryId: 202,
        lng: -98,
        lat: 56,
        openDays: 29,
        quote: "Sign-in with Google loops back to the login page.",
    },
    {
        country: "Nigeria",
        countryId: 90,
        lng: 8,
        lat: 9,
        openDays: 48,
        quote: "Mobile menu stays open after navigating.",
    },
];

const SLIDE_MS = 6200;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export default function BacklogGlobeSection() {
    const frozen = useReducedMotion() ?? false;
    const [active, setActive] = useState(0);
    const issue = OPEN_ISSUES[active];

    useEffect(() => {
        if (frozen) return;
        const timer = setTimeout(() => setActive((i) => (i + 1) % OPEN_ISSUES.length), SLIDE_MS);
        return () => clearTimeout(timer);
    }, [active, frozen]);

    return (
        <section
            id="backlog"
            aria-labelledby="backlog-title"
            className="relative overflow-hidden bg-paper"
        >
            <div className="relative mx-auto flex min-h-svh max-w-page flex-col px-4 pt-24 pb-8 md:px-8 md:pt-28 md:pb-10">
                <IssueGlobe focus={issue} frozen={frozen} className="absolute inset-0 h-auto" />

                <div className="pointer-events-none relative z-10 mx-auto max-w-[760px] text-center">
                    <FadeIn>
                        <h2
                            id="backlog-title"
                            className="mx-auto max-w-[14ch] text-[clamp(36px,4.4vw,60px)] leading-[1.02] font-medium tracking-[-0.05em] text-balance text-stone-950"
                        >
                            Your backlog grows faster than you ship
                        </h2>
                    </FadeIn>
                    <FadeIn delay={0.12}>
                        <p className="mx-auto mt-6 max-w-[46ch] text-[clamp(15px,1.15vw,16px)] leading-[1.55] text-stone-600">
                            Most of a backlog is small, well-understood work: a broken filter, a
                            flaky sign-in, an export that drops a row. Each one waits weeks for an
                            engineer, a context switch and a review, until{" "}
                            <a
                                href="#how-it-works"
                                className="pointer-events-auto underline decoration-stone-400 underline-offset-4 hover:decoration-stone-900"
                            >
                                Darwin picks it up
                            </a>
                            .
                        </p>
                    </FadeIn>
                </div>

                <div className="pointer-events-none relative z-10 mt-auto grid gap-8 pt-16 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-end md:gap-6">
                    <div>
                        <div
                            role="tablist"
                            aria-label="Open issues"
                            className="pointer-events-auto flex items-center gap-2"
                        >
                            {OPEN_ISSUES.map((entry, index) => {
                                const selected = index === active;
                                return (
                                    <button
                                        key={entry.country}
                                        type="button"
                                        role="tab"
                                        aria-selected={selected}
                                        aria-label={entry.country}
                                        onClick={() => setActive(index)}
                                        className={`relative h-1.5 overflow-hidden rounded-full bg-stone-300 transition-[width,background-color] duration-500 ${selected ? "w-6" : "w-1.5 hover:bg-stone-500"}`}
                                    >
                                        {selected && (
                                            <m.span
                                                key={active}
                                                aria-hidden
                                                className="absolute inset-0 origin-left bg-stone-900"
                                                initial={{ scaleX: frozen ? 1 : 0 }}
                                                animate={{ scaleX: 1 }}
                                                transition={{
                                                    duration: frozen ? 0 : SLIDE_MS / 1000,
                                                    ease: "linear",
                                                }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        <AnimatePresence mode="wait" initial={false}>
                            <m.figure
                                key={active}
                                initial={frozen ? false : { opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={frozen ? undefined : { opacity: 0, y: -10 }}
                                transition={{ duration: 0.45, ease: EASE_OUT }}
                                className="mt-5"
                            >
                                <figcaption className="inline-block bg-amber-200 px-1.5 py-0.5 text-[11px] font-medium tracking-[0.08em] text-stone-900 uppercase">
                                    {issue.country} · open {issue.openDays} days
                                </figcaption>
                                <blockquote className="mt-3 max-w-[26ch] text-[clamp(20px,1.9vw,28px)] leading-[1.25] font-medium tracking-[-0.03em] text-stone-950">
                                    “{issue.quote}”
                                </blockquote>
                            </m.figure>
                        </AnimatePresence>
                    </div>

                    <div className="pointer-events-auto md:justify-self-center">
                        <PlainTicketLink href="#how-it-works" label="See how it works" />
                    </div>

                    <p className="text-[12px] text-stone-500 md:justify-self-end md:text-right">
                        Illustrative · each dot is one open issue
                    </p>
                </div>
            </div>
        </section>
    );
}

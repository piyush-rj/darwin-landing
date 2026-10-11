"use client";

import { motion, type MotionValue, useScroll, useTransform } from "motion/react";
import type { CSSProperties } from "react";

import FadeIn from "@/components/new-landing/FadeIn";
import HairlineFigure from "@/components/utility/HairlineFigure";
import RollingText from "@/components/utility/RollingText";
import type { FigureMount } from "@/lib/hairline/core/stage";
import { mountClaimWork } from "@/lib/hairline/figures/claimWork";
import { mountIssueIntake } from "@/lib/hairline/figures/issueIntake";
import { mountPullRequestFlow } from "@/lib/hairline/figures/pullRequestFlow";
import { mountSandboxTests } from "@/lib/hairline/figures/sandboxTests";

type StepCard = {
    step: number;
    tone: string;
    label: string;
    title: string;
    body: string;
    points: string[];
    figure: FigureMount;
    figureLabel: string;
    cascade: { left: number; right: number; top: number };
};

const STEP_CARDS: StepCard[] = [
    {
        step: 1,
        tone: "var(--color-amber-300)",
        label: "Filed",
        title: "Issues land where your team already talks.",
        body: "File from Slack, Telegram, Figma or GitHub. Darwin reads every source and keeps one backlog.",
        points: ["No new tool to learn", "One backlog for every channel"],
        figure: mountIssueIntake,
        figureLabel: "Issues travel from Slack, Telegram and Figma into one backlog.",
        cascade: { left: 0, right: 3, top: 80 },
    },
    {
        step: 2,
        tone: "var(--color-orange-500)",
        label: "Picked up",
        title: "Darwin claims the work it can finish.",
        body: "It reads the issue and the code around it, then moves the card to in progress. Vague issues get a question, not a guess.",
        points: ["Scopes before it codes", "Only takes work it can verify"],
        figure: mountClaimWork,
        figureLabel: "Darwin lifts a card from todo and moves it to in progress.",
        cascade: { left: 5, right: 6, top: 0 },
    },
    {
        step: 3,
        tone: "var(--color-pink-300)",
        label: "Tested",
        title: "Every fix runs against your real tests.",
        body: "Each change is built in a sandboxed runner cloned from your repo. The runner is destroyed when the run ends.",
        points: ["One runner per fix", "Your test suite decides"],
        figure: mountSandboxTests,
        figureLabel:
            "A sandboxed runner spins up, its tests pass one by one, then it is destroyed.",
        cascade: { left: 9, right: 2, top: 160 },
    },
    {
        step: 4,
        tone: "var(--color-sky-400)",
        label: "Almost done",
        title: "A pull request, waiting for your yes.",
        body: "Darwin opens the PR with the diff, the tests it ran and why. You review, it addresses feedback, you merge.",
        points: ["You review every change", "Nothing ships without a yes"],
        figure: mountPullRequestFlow,
        figureLabel:
            "A branch of commits becomes a pull request, gets approved and merges into main.",
        cascade: { left: 16, right: 0, top: 112 },
    },
];

const MONO_LABEL = "font-mono text-[11px] tracking-[0.12em] text-neutral-500 uppercase";
const CARD_GAP_PX = 24;
const ENTRY_STAGGER_SECONDS = 0.12;
const ENTRY = { duration: 0.9, ease: [0.22, 1, 0.36, 1] } as const;
const SPREAD_SCROLL_PX = 260;
const CARD_HEIGHT = "560px";

function StepCardView({
    card,
    index,
    scrollY,
}: {
    card: StepCard;
    index: number;
    scrollY: MotionValue<number>;
}) {
    const spread = [0, SPREAD_SCROLL_PX];
    const remaining = useTransform(scrollY, spread, [1, 0]);

    return (
        <motion.div
            initial={{ y: 140 }}
            animate={{ y: 0 }}
            transition={{
                ...ENTRY,
                delay: 0.2 + ENTRY_STAGGER_SECONDS * index,
            }}
        >
            <motion.article
                className="relative isolate flex min-h-[34rem] flex-col overflow-hidden text-black md:flex-row lg:mr-[calc(var(--remaining)*var(--cascade-right))] lg:ml-[calc(var(--remaining)*var(--cascade-left))] lg:h-(--card-height) lg:min-h-0 lg:translate-y-[calc(var(--remaining)*(var(--cascade-top)-var(--list-offset)))]"
                style={
                    {
                        backgroundColor: card.tone,
                        "--remaining": remaining,
                        "--cascade-top": `${card.cascade.top}px`,
                        "--cascade-left": `${card.cascade.left}%`,
                        "--cascade-right": `${card.cascade.right}%`,
                        "--card-height": CARD_HEIGHT,
                        "--list-offset": `calc(${index} * (${CARD_HEIGHT} + ${CARD_GAP_PX}px))`,
                    } as CSSProperties
                }
            >
                <div className="grain-strong pointer-events-none absolute inset-0 -z-10 opacity-15" />
                <div className="flex flex-col px-4 pt-4 pb-5 md:w-[28%] md:px-5">
                    <span className="text-[11px] font-medium">Step</span>
                    <span className="mt-3 text-[88px] leading-[0.8] font-semibold tracking-[-0.06em] lg:text-[132px]">
                        {card.step}.
                    </span>
                    <ul className="mt-6 flex flex-col gap-2 md:mt-auto">
                        {card.points.map((point) => (
                            <li
                                key={point}
                                className="flex items-center gap-2 text-[13px] font-medium"
                            >
                                <span
                                    aria-hidden
                                    className="size-1.5 shrink-0 rounded-full bg-black"
                                />
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="flex min-h-0 flex-1 flex-col border-black/70 px-4 pt-5 pb-4 max-md:border-t md:border-l md:px-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-[11px] font-medium">{card.label}</span>
                            <h2 className="flex max-w-[24ch] gap-2 text-[20px] leading-[1.15] font-medium tracking-[-0.02em] lg:text-[26px]">
                                <span aria-hidden>→</span>
                                {card.title}
                            </h2>
                        </div>
                    </div>
                    <p className="mt-3 max-w-[52ch] pl-6 text-[14px] leading-[1.5] text-black/80">
                        {card.body}
                    </p>
                    <div
                        className="relative mt-2 aspect-[4/3] w-full lg:aspect-auto lg:min-h-0 lg:flex-1"
                        style={
                            {
                                "--figure-ground": card.tone,
                                "--figure-ink": "var(--color-black)",
                                "--figure-fill": "var(--color-white)",
                                "--figure-fill-edge": "var(--color-black)",
                            } as CSSProperties
                        }
                    >
                        <HairlineFigure
                            figure={card.figure}
                            value={0}
                            label={card.figureLabel}
                            className="absolute inset-0 h-full"
                        />
                    </div>
                </div>
            </motion.article>
        </motion.div>
    );
}

export default function HowItWorksPageHero() {
    const { scrollY } = useScroll();

    return (
        <section className="w-full bg-ink">
            <div className="grid grid-cols-1 border-b border-edge lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
                <div className="border-edge px-6 pt-20 pb-12 md:px-9 lg:border-r lg:pt-28">
                    <p className={MONO_LABEL}>How it works</p>
                    <h1 className="mt-5 max-w-[18ch] text-[40px] leading-[1] font-medium tracking-[-0.04em] text-foreground sm:text-[52px] lg:text-[60px]">
                        <RollingText text="Four steps from issue to pull request." />
                    </h1>
                </div>
                <div className="flex items-end bg-mist px-6 py-10 max-lg:border-t max-lg:border-edge md:px-9">
                    <FadeIn delay={0.15}>
                        <p className="max-w-[30ch] text-[19px] leading-[1.35] tracking-[-0.01em] text-foreground">
                            Darwin turns the issues your team files into tested pull requests, so
                            you don&apos;t have to.
                        </p>
                    </FadeIn>
                </div>
            </div>

            <div className="flex flex-col gap-4 px-3 pt-6 pb-12 md:gap-6 md:px-9 md:pt-10 md:pb-16 lg:pb-24">
                {STEP_CARDS.map((card, index) => (
                    <StepCardView key={card.step} card={card} index={index} scrollY={scrollY} />
                ))}
            </div>
        </section>
    );
}

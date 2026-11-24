"use client";

import FadeIn from "@/components/new-landing/FadeIn";
import HairlineFigure from "@/components/utility/HairlineFigure";
import type { FigureMount } from "@/lib/hairline/core/stage";
import { mountClaimWork } from "@/lib/hairline/figures/claimWork";
import { mountPullRequestFlow } from "@/lib/hairline/figures/pullRequestFlow";
import { mountSandboxTests } from "@/lib/hairline/figures/sandboxTests";

import SectionHeader from "./SectionHeader";

type Stage = {
    number: string;
    title: string;
    body: string;
    figure: FigureMount;
    figureLabel: string;
};

const STAGES: Stage[] = [
    {
        number: "01",
        title: "You file the issue. Darwin picks it up.",
        body: "Keep the board your team already uses. Darwin claims well-scoped issues the moment they land and moves them into progress.",
        figure: mountClaimWork,
        figureLabel:
            "An issue card is lifted from To do and dropped into In progress on the board.",
    },
    {
        number: "02",
        title: "We fix it in a runner. Your tests decide.",
        body: "Every fix runs in a sandboxed runner that clones your repo, makes the change and runs your real test suite. Nothing ships on a guess.",
        figure: mountSandboxTests,
        figureLabel: "A fix runs inside a sandbox while the test suite checks it.",
    },
    {
        number: "03",
        title: "We open the pull request. You merge it.",
        body: "Darwin hands back a pull request with the passing checks attached. Review it like a teammate's work, merge it, and the issue closes itself.",
        figure: mountPullRequestFlow,
        figureLabel: "A pull request is opened, reviewed and merged.",
    },
];

function StageCard({ stage, index }: { stage: Stage; index: number }) {
    return (
        <FadeIn delay={index * 0.1}>
            <figure className="flex h-full flex-col bg-cocoa-card p-3 ring-1 ring-parchment/8">
                <div className="flex h-72 items-center justify-center bg-parchment px-4 [--figure-ground:var(--color-parchment)] [--figure-ink:var(--color-stone-900)] md:h-80">
                    <HairlineFigure figure={stage.figure} value={0} label={stage.figureLabel} />
                </div>
                <figcaption className="flex flex-1 flex-col px-2 pt-6 pb-3">
                    <p className="text-[21px] leading-[1.2] font-medium tracking-[-0.025em] text-parchment">
                        {stage.title}
                    </p>
                    <p className="mt-2 text-[14px] leading-snug text-parchment/70">{stage.body}</p>
                </figcaption>
            </figure>
        </FadeIn>
    );
}

export default function HowItWorksSection() {
    return (
        <section
            id="how-it-works"
            aria-labelledby="how-it-works-title"
            className="w-full bg-cocoa px-4 py-20 md:px-8 md:py-28"
        >
            <div className="mx-auto max-w-page">
                <SectionHeader
                    label="How it works"
                    tone="dark"
                    titleId="how-it-works-title"
                    title="One issue in. One tested pull request out."
                    description="Darwin takes the issue from your board, fixes it where your code really runs and comes back with something you can merge. Nothing ships until a person approves it."
                />

                <div className="mt-14 grid gap-6 md:mt-20 md:grid-cols-3 md:gap-8">
                    {STAGES.map((stage, index) => (
                        <StageCard key={stage.number} stage={stage} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}

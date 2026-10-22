"use client";

import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { CtaArrowIcon } from "@/components/icons";
import { DARWIN_LOGO_BRAND_COLOR, DarwinBlockLogo } from "@/components/logo/DarwinBlockLogo";
import { MONO_LABEL } from "@/components/new-landing/landingType";
import RollingText from "@/components/utility/RollingText";
import { cn } from "@/lib/utils";

import PixelSprite, { type PixelSpriteArt } from "../PixelSprite";

type Alternative = { id: string; name: string; headline: string; today: string; darwin: string };

const ALTERNATIVES: Alternative[] = [
    {
        id: "yourself",
        name: "Doing it yourself",
        headline: "Your engineers can fix it. They just can't fix all of it.",
        today: "Every small issue costs a context switch: find the code, reproduce it, fix it, test it, open the pull request. Then do it again for the next one.",
        darwin: "Darwin takes the long tail, so your team stays on the work that actually needs them.",
    },
    {
        id: "claude",
        name: "You + Claude",
        headline: "Claude writes the code. You still do everything around it.",
        today: "You pick the issue, explain it, wait, read what it wrote, run it locally, check the UI and open the pull request yourself.",
        darwin: "Darwin runs Claude Code in its own sandbox from start to finish and comes back with the pull request and the proof.",
    },
    {
        id: "copilot",
        name: "Copilot coding agent",
        headline: "Built for teams that live entirely in GitHub.",
        today: "You assign a GitHub issue and get a draft pull request back.",
        darwin: "Darwin starts from its own board as well as GitHub, re-runs a failing test on the old and new code, and shows UI changes side by side.",
    },
    {
        id: "devin",
        name: "Devin",
        headline: "A general-purpose engineer you talk to.",
        today: "You describe work in chat and it gets done on its own machine.",
        darwin: "Darwin is built around the board: the issue is the unit of work, every pull request carries its proof, and you choose which coding agent runs it.",
    },
    {
        id: "cursor",
        name: "Cursor background agents",
        headline: "Agents that start from the editor.",
        today: "Great when an engineer is already in the code and wants work done in the background.",
        darwin: "With Darwin anyone on the team can file the issue, no editor needed, and Darwin asks its questions in Slack, Telegram or Discord.",
    },
    {
        id: "codex",
        name: "OpenAI Codex",
        headline: "One model family, in the cloud.",
        today: "Codex takes tasks from ChatGPT or your IDE and returns a pull request.",
        darwin: "Darwin runs Codex too, or Claude Code, or OpenCode, chosen per project or per issue.",
    },
];

const EYES: PixelSpriteArt = {
    rows: [
        ".ooooo...ooooo.",
        "owwwwwo.owwwwwo",
        "owwwkko.owwwkko",
        "owwwkko.owwwkko",
        "owwwkko.owwwkko",
        "owwwkko.owwwkko",
        "owwwwwo.owwwwwo",
        "ogwwwwo.ogwwwwo",
        ".ooooo...ooooo.",
    ],
    colors: { o: "#3f3f46", w: "#ffffff", k: "#18181b", g: "#d4d4d8" },
};

const KEY: PixelSpriteArt = {
    rows: [
        ".hbbbb...",
        "hbb..bbd.",
        "hbb..bbd.",
        ".hbbbbd..",
        "...bd....",
        "...bd....",
        "...bdbb..",
        "...bd....",
        "...bdbb..",
        "...bd....",
        "...dd....",
    ],
    colors: { b: "#7c5ce6", h: "#a78bfa", d: "#6d28d9" },
};

const FLAG: PixelSpriteArt = {
    rows: [
        ".pp..........",
        ".pphbbbbbbb..",
        ".ppbbbbbbbbb.",
        ".ppbbbbbbbbbb",
        ".ppbbbbbbbbb.",
        ".ppdbbbbbbb..",
        ".pp..........",
        ".pp..........",
        ".pp..........",
        ".pp..........",
        ".pp..........",
        ".pp..........",
        "ggggg........",
    ],
    colors: { p: "#52525b", b: "#7c5ce6", h: "#a78bfa", d: "#6d28d9", g: "#a1a1aa" },
};

function AlternativeBlock({
    alternative,
    index,
    onActive,
}: {
    alternative: Alternative;
    index: number;
    onActive: (index: number) => void;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const centered = useInView(ref, { margin: "-45% 0px -45% 0px" });

    useEffect(() => {
        if (centered) onActive(index);
    }, [centered, index, onActive]);

    return (
        <div
            ref={ref}
            id={`compare-${alternative.id}`}
            className="scroll-mt-24 border-b border-edge px-6 py-14 last:border-b-0 md:px-9 lg:py-20"
        >
            <p className={cn("mb-4 lg:hidden", MONO_LABEL)}>{alternative.name}</p>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center lg:gap-14">
                <div>
                    <h3 className="max-w-[22ch] text-[30px] leading-[1.08] tracking-[-0.035em] text-foreground sm:text-[38px]">
                        {alternative.headline}
                    </h3>
                    <p className="mt-6 max-w-[52ch] text-[16px] leading-[1.55] text-neutral-500">
                        {alternative.today}
                    </p>
                </div>
                <div className="border border-edge border-l-[3px] border-l-amber-500 bg-[color-mix(in_oklab,var(--color-amber-500)_7%,var(--color-snow))] p-6 lg:p-7">
                    <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] text-amber-700 uppercase">
                        <DarwinBlockLogo className={cn("size-4", DARWIN_LOGO_BRAND_COLOR)} />
                        With Darwin
                    </p>
                    <p className="mt-3 text-[16px] leading-[1.55] text-foreground">
                        {alternative.darwin}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function CompareSection() {
    const [active, setActive] = useState(0);

    return (
        <section id="compare" className="w-full border-b border-edge bg-ink">
            <div className="flex flex-col items-center px-6 pt-20 pb-14 text-center md:px-9 lg:pt-28 lg:pb-20">
                <div aria-hidden className="flex items-end gap-6">
                    <PixelSprite art={EYES} scale={4} />
                    <PixelSprite art={KEY} scale={3.6} />
                    <PixelSprite art={FLAG} scale={3.2} />
                </div>
                <h2 className="mt-8 text-[40px] leading-[1] font-normal tracking-[-0.04em] text-foreground sm:text-[52px] lg:text-[60px]">
                    <RollingText text="Where Darwin fits." />
                </h2>
            </div>

            <div className="grid border-t border-edge lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
                <nav aria-label="Alternatives" className="border-edge max-lg:hidden lg:border-r">
                    <ul className="sticky top-11 flex flex-col gap-1 px-6 py-10 md:px-9">
                        {ALTERNATIVES.map((alternative, index) => (
                            <li key={alternative.id}>
                                <a
                                    href={`#compare-${alternative.id}`}
                                    className={cn(
                                        "flex items-center justify-between py-2 text-[15px] transition-colors",
                                        index === active
                                            ? "text-foreground"
                                            : "text-neutral-400 hover:text-foreground",
                                    )}
                                >
                                    {alternative.name}
                                    <CtaArrowIcon
                                        className={cn(
                                            "size-4 transition-opacity",
                                            index === active ? "opacity-100" : "opacity-0",
                                        )}
                                    />
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div>
                    {ALTERNATIVES.map((alternative, index) => (
                        <AlternativeBlock
                            key={alternative.id}
                            alternative={alternative}
                            index={index}
                            onActive={setActive}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

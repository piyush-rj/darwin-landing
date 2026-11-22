"use client";

import * as m from "motion/react-m";
import type { ComponentType, ReactNode } from "react";

import {
    CheckIcon,
    EditIcon,
    FileIcon,
    GitBranchIcon,
    PullRequestOpenIcon,
    SearchIcon,
    SuccessCircleIcon,
    TerminalIcon,
} from "@/components/icons";
import { DarwinBlockLogo } from "@/components/logo/DarwinBlockLogo";

import { PANEL } from "./playgroundBoard";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

function Panel({ children }: { children: ReactNode }) {
    return (
        <m.div
            className="surface-menu absolute z-20 overflow-hidden rounded-xl text-[12.5px] text-neutral-200 shadow-2xl shadow-black/50"
            style={PANEL}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.18 } }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
        >
            {children}
        </m.div>
    );
}

function PanelHeader({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
    return (
        <div className="flex items-center gap-2 border-b border-overlay/6 px-4 py-3">
            {children}
            {aside && <span className="ml-auto text-[11px] text-neutral-500">{aside}</span>}
        </div>
    );
}

function Reveal({ index, children }: { index: number; children: ReactNode }) {
    return (
        <m.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 + index * 0.14, ease: EASE_OUT }}
        >
            {children}
        </m.div>
    );
}

type LogLine = {
    Icon: ComponentType<{ className?: string }>;
    text: ReactNode;
    detail?: ReactNode;
};

const LOG_LINES: LogLine[] = [
    { Icon: FileIcon, text: "Read src/board/CardAvatars.tsx" },
    { Icon: SearchIcon, text: <>Searched &ldquo;avatarTone&rdquo;</> },
    {
        Icon: EditIcon,
        text: "Edited src/board/CardAvatars.tsx",
        detail: (
            <>
                <span className="text-green-400">+18</span> <span className="text-red-400">−6</span>
            </>
        ),
    },
    { Icon: TerminalIcon, text: "Ran bun test", detail: "212 passed" },
    { Icon: PullRequestOpenIcon, text: "Opened pull request #482" },
    { Icon: CheckIcon, text: "Agent finished in 3m 12s" },
];

export function LogsPanel() {
    return (
        <Panel>
            <PanelHeader aside="NOC-42 · attempt 1">
                <span className="font-medium text-neutral-100">Agent logs</span>
            </PanelHeader>
            <div className="relative px-4 py-3">
                <span className="absolute top-6 bottom-6 left-[27px] w-px bg-overlay/8" />
                {LOG_LINES.map((line, index) => (
                    <Reveal key={index} index={index}>
                        <div className="relative flex h-8 items-center gap-3">
                            <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-graphite text-neutral-400 ring-1 ring-overlay/8">
                                <line.Icon className="size-3" />
                            </span>
                            <span className="truncate text-neutral-300">{line.text}</span>
                            {line.detail && (
                                <span className="ml-auto shrink-0 text-[11px] text-neutral-500 tabular-nums">
                                    {line.detail}
                                </span>
                            )}
                        </div>
                    </Reveal>
                ))}
            </div>
        </Panel>
    );
}

const ANSWERS = [
    { command: "bun run dev", detail: "Web app only" },
    { command: "bun run dev:all", detail: "Web, server and workers" },
];

export function QuestionCard() {
    return (
        <Panel>
            <PanelHeader aside="NOC-42">
                <DarwinBlockLogo className="size-5" />
                <span className="font-medium text-neutral-100">The agent is asking</span>
            </PanelHeader>
            <div className="px-4 py-4">
                <p className="text-[13.5px] leading-snug text-neutral-100">
                    Two dev scripts exist. Which one brings up the full stack?
                </p>
                <div className="mt-3.5 flex flex-col gap-1.5">
                    {ANSWERS.map((answer, index) => (
                        <Reveal key={answer.command} index={index}>
                            <div
                                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 ring-1 ${index === 1 ? "bg-overlay/6 ring-overlay/15" : "ring-overlay/8"}`}
                            >
                                <span
                                    className={`flex size-[18px] shrink-0 items-center justify-center rounded-[5px] text-[10px] font-semibold ${index === 1 ? "bg-overlay text-ink" : "bg-overlay/8 text-neutral-400"}`}
                                >
                                    {index + 1}
                                </span>
                                <span className="font-medium text-neutral-100">
                                    {answer.command}
                                </span>
                                <span className="ml-auto text-[11px] text-neutral-500">
                                    {answer.detail}
                                </span>
                            </div>
                        </Reveal>
                    ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                    <span className="flex-1 rounded-lg px-3 py-2.5 text-neutral-500 ring-1 ring-overlay/8">
                        Type your own answer…
                    </span>
                    <span className="rounded-lg bg-overlay px-3.5 py-2.5 font-medium text-ink">
                        Send
                    </span>
                </div>
            </div>
        </Panel>
    );
}

const CHECKS = ["Tests · 212 passed", "Lint", "Typecheck"];

export function PullRequestPanel() {
    return (
        <Panel>
            <div className="border-b border-overlay/6 px-4 py-3.5">
                <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-400/15 text-indigo-300">
                        <PullRequestOpenIcon className="size-3.5" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-[13.5px] leading-snug font-medium text-neutral-100">
                            Fix avatar colour flash on first paint
                        </p>
                        <p className="mt-1 text-[11px] text-neutral-500">
                            appx/nocturn #482 · opened by darwin
                        </p>
                    </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-neutral-400">
                    <span className="flex items-center gap-1 rounded-full px-2 py-0.5 ring-1 ring-overlay/8">
                        <GitBranchIcon className="size-3" />
                        main ← darwin/noc-42
                    </span>
                    <span className="tabular-nums">2 files</span>
                    <span className="text-green-400 tabular-nums">+18</span>
                    <span className="text-red-400 tabular-nums">−6</span>
                </div>
            </div>
            <div className="px-4 py-2.5">
                {CHECKS.map((check, index) => (
                    <Reveal key={check} index={index}>
                        <div className="flex h-7.5 items-center gap-2 text-neutral-300">
                            <SuccessCircleIcon className="size-4 text-green-400" />
                            {check}
                        </div>
                    </Reveal>
                ))}
            </div>
            <div className="flex items-center gap-3 border-t border-overlay/6 bg-overlay/3 px-4 py-3.5">
                <div className="min-w-0 flex-1">
                    <p className="font-medium text-neutral-100">No conflicts with base branch</p>
                    <p className="text-[11px] text-neutral-500">
                        This branch can be merged automatically.
                    </p>
                </div>
                <span className="shrink-0 rounded-lg bg-overlay px-3.5 py-2.5 font-medium text-ink">
                    Merge pull request
                </span>
            </div>
        </Panel>
    );
}

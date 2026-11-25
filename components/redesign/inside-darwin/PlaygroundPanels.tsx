"use client";

import { AnimatePresence, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { type ComponentType, type ReactNode, useEffect, useState } from "react";

import {
    EditIcon,
    FileIcon,
    PullRequestOpenIcon,
    SearchIcon,
    SendArrowIcon,
    SpinnerIcon,
    SuccessCircleIcon,
    TerminalIcon,
} from "@/components/icons";

import type { PanelKind } from "./playgroundBoard";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const PANEL_CONTENT: Record<PanelKind, ComponentType> = {
    logs: LogsPanel,
    question: QuestionCard,
    pullRequest: PullRequestPanel,
};

const CONTENT_VARIANTS = {
    enter: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6, transition: { duration: 0.12, when: "afterChildren" } },
};

const PRESS_VARIANTS = {
    exit: { scale: [1, 0.94, 1], transition: { duration: 0.12 } },
};

export function PanelContent({ kind }: { kind: PanelKind }) {
    const Content = PANEL_CONTENT[kind];
    return (
        <AnimatePresence mode="wait" initial={false}>
            <m.div
                key={kind}
                variants={CONTENT_VARIANTS}
                initial={{ opacity: 0, y: 6 }}
                animate="enter"
                exit="exit"
                transition={{ duration: 0.3, ease: EASE_OUT }}
                className="text-[12.5px] text-neutral-200"
            >
                <Content />
            </m.div>
        </AnimatePresence>
    );
}

function Label({ children }: { children: ReactNode }) {
    return <p className="text-[11px] tracking-wide text-neutral-500 uppercase">{children}</p>;
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
    { Icon: FileIcon, text: "Read src/theme/tokens.ts" },
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
    { Icon: FileIcon, text: "Read src/board/CardAvatars.test.tsx" },
    {
        Icon: EditIcon,
        text: "Edited src/board/CardAvatars.test.tsx",
        detail: (
            <>
                <span className="text-green-400">+9</span> <span className="text-red-400">−0</span>
            </>
        ),
    },
    { Icon: TerminalIcon, text: "Ran bun test", detail: "214 passed" },
    { Icon: TerminalIcon, text: "Ran bun run lint" },
    { Icon: TerminalIcon, text: "Ran bun run typecheck" },
];

const VISIBLE_LOG_LINES = 5;
const LOG_LINE_HEIGHT = 28;
const LOG_TAIL_INTERVAL = 900;
const LOG_SCROLL = { duration: 0.35, ease: EASE_OUT } as const;

function useLogTail() {
    const reduceMotion = useReducedMotion();
    const [newest, setNewest] = useState(VISIBLE_LOG_LINES - 1);

    useEffect(() => {
        if (reduceMotion) return;
        const timer = setInterval(() => setNewest((index) => index + 1), LOG_TAIL_INTERVAL);
        return () => clearInterval(timer);
    }, [reduceMotion]);

    const oldest = newest - VISIBLE_LOG_LINES + 1;
    const lines = Array.from({ length: VISIBLE_LOG_LINES + 1 }, (_, offset) => {
        const index = oldest - 1 + offset;
        return { index, line: LOG_LINES[index % LOG_LINES.length], live: index === newest };
    }).filter(({ index }) => index >= 0);

    return { lines, oldest };
}

function LogsPanel() {
    const { lines, oldest } = useLogTail();
    return (
        <>
            <Label>Agent logs</Label>
            <div
                className="relative mt-1.5 overflow-hidden"
                style={{ height: VISIBLE_LOG_LINES * LOG_LINE_HEIGHT }}
            >
                {lines.map(({ index, line, live }) => (
                    <m.div
                        key={index}
                        className="absolute inset-x-0 top-0 flex h-7 items-center gap-2.5"
                        initial={{ y: VISIBLE_LOG_LINES * LOG_LINE_HEIGHT, opacity: 0 }}
                        animate={{
                            y: (index - oldest) * LOG_LINE_HEIGHT,
                            opacity: index < oldest ? 0 : 1,
                        }}
                        transition={LOG_SCROLL}
                    >
                        <span
                            className={`flex w-4 shrink-0 justify-center ${live ? "text-yellow-400" : "text-neutral-500"}`}
                        >
                            {live ? (
                                <SpinnerIcon className="size-3.5 animate-spin" />
                            ) : (
                                <line.Icon className="size-3.5" />
                            )}
                        </span>
                        <span
                            className={`truncate ${live ? "text-neutral-100" : "text-neutral-300"}`}
                        >
                            {line.text}
                        </span>
                        {line.detail && !live && (
                            <span className="ml-auto shrink-0 text-[11px] text-neutral-500 tabular-nums">
                                {line.detail}
                            </span>
                        )}
                    </m.div>
                ))}
            </div>
        </>
    );
}

const ANSWERS = [
    { command: "bun run dev", detail: "Web app only" },
    { command: "bun run dev:all", detail: "Web, server and workers" },
];

function QuestionCard() {
    return (
        <>
            <Label>Darwin is asking</Label>
            <p className="mt-1.5 text-[13px] leading-snug text-neutral-100">
                Two dev scripts exist. Which one brings up the full stack?
            </p>
            <div className="mt-2.5 flex flex-col">
                {ANSWERS.map((answer, index) => (
                    <Reveal key={answer.command} index={index}>
                        <div
                            className={`flex h-8 items-center gap-2.5 rounded-md px-2.5 ${index === 1 ? "bg-overlay/6" : ""}`}
                        >
                            <span
                                className={`flex size-4 shrink-0 items-center justify-center rounded-[4px] text-[10px] font-semibold ${index === 1 ? "bg-overlay text-ink" : "bg-overlay/8 text-neutral-400"}`}
                            >
                                {index + 1}
                            </span>
                            <span className="font-medium text-neutral-100">{answer.command}</span>
                            <span className="ml-auto text-[11px] text-neutral-500">
                                {answer.detail}
                            </span>
                        </div>
                    </Reveal>
                ))}
            </div>
            <div className="mt-2.5 flex items-center gap-0.5 rounded-md border border-overlay/8 py-1.5 pr-1.5 pl-2.5 text-neutral-500">
                <span className="h-3.5 w-px animate-pulse bg-neutral-300" />
                <span className="flex-1">Type your own answer…</span>
                <m.span
                    className="flex size-6 items-center justify-center rounded-[5px] bg-overlay text-ink"
                    variants={PRESS_VARIANTS}
                >
                    <SendArrowIcon className="size-4" />
                </m.span>
            </div>
        </>
    );
}

const CHECKS = ["Tests · 212 passed", "Lint", "Typecheck"];
const CHECK_PASS_DELAY = 700;
const CHECK_PASS_STAGGER = 500;

function CheckRow({ check, index }: { check: string; index: number }) {
    const reduceMotion = useReducedMotion();
    const [passed, setPassed] = useState(reduceMotion);

    useEffect(() => {
        if (reduceMotion) return;
        const timer = setTimeout(
            () => setPassed(true),
            CHECK_PASS_DELAY + index * CHECK_PASS_STAGGER,
        );
        return () => clearTimeout(timer);
    }, [index, reduceMotion]);

    return (
        <Reveal index={index}>
            <div className="flex h-7 items-center gap-2.5 text-neutral-300">
                <span className="flex w-4 justify-center">
                    {passed ? (
                        <SuccessCircleIcon className="size-3.5 text-green-400" />
                    ) : (
                        <SpinnerIcon className="size-3.5 animate-spin text-neutral-500" />
                    )}
                </span>
                {check}
            </div>
        </Reveal>
    );
}

function PullRequestPanel() {
    return (
        <>
            <Label>Pull request</Label>
            <div className="mt-1.5 flex items-start gap-2.5">
                <PullRequestOpenIcon className="mt-0.5 size-3.5 shrink-0 text-indigo-300" />
                <div className="min-w-0">
                    <p className="text-[13px] leading-snug font-medium text-neutral-100">
                        Fix avatar colour flash on first paint
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-[11px] text-neutral-500 tabular-nums">
                        #482 · 2 files
                        <span className="text-green-400">+18</span>
                        <span className="-ml-1 text-red-400">−6</span>
                    </p>
                </div>
            </div>
            <div className="mt-2 border-t border-overlay/8 pt-1">
                {CHECKS.map((check, index) => (
                    <CheckRow key={check} check={check} index={index} />
                ))}
            </div>
        </>
    );
}
